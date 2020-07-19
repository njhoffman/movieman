const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const pb = require('pretty-bytes');
const crypto = require('crypto');
const chalk = require('chalk');

const logger = require('./logger').getLogger('files');
const { shellFilePath, library } = require('../config');

const { padRight } = require('./utils');

const checkExists = target => {
  try {
    const stat = fs.statSync(target);
    return stat;
  } catch {
    return false;
  }
};

const getFileSizes = files =>
  files.map(file => {
    const stat = fs.statSync(file);
    return [file, stat.size];
  });

const getTargetFiles = (target, options = {}) => {
  const { recursive = false } = options;
  const exists = checkExists(target);
  if (exists && exists.isFile()) {
    return [path.resolve(target), exists.size];
  } else if (exists && exists.isDirectory()) {
    const globPath = recursive ? `${target}/**/*` : `${target}/*`;
    return glob.sync(globPath).filter(targetPath => fs.statSync(targetPath).isFile());
  }
  return [];
};

const buildShellFile = dupes => {
  const shellFile = [
    '#!/bin/bash',
    '',
    '### dupe cleaner script',
    `### ran: ${new Date().toLocaleString()}`
  ];

  let removeSize = 0;
  let removeCount = 0;
  _.each(dupes, ([title, videos]) => {
    shellFile.push('', `# ${title}`);
    const removeLines = [];
    _.each(videos, (video, i) => {
      const {
        general: { FileSize, OverallBitRate, Duration },
        video: { Width, Height },
        file
      } = video;

      shellFile.push(
        [
          `#    ${file}`,
          `${padRight(pb(_.toNumber(FileSize)), 10)}`,
          padRight(`${pb(_.toNumber(OverallBitRate) / 8)}/s`, 10),
          padRight(`${Width}x${Height}`, 10),
          `${(Duration / 60).toFixed(2)} min`
        ].join(' ')
      );

      if (i > 0) {
        removeSize += _.toNumber(FileSize);
        removeCount += 1;
        shellFile.push(`rm "${file}"`);
      }
    });
  });
  shellFile.push('', `# Removing: ${removeCount} files, ${pb(removeSize)}`);

  const shellFolder = path.resolve(shellFilePath).split('/').slice(0, -1).join('/');
  if (!fs.existsSync(shellFolder)) {
    logger.info(`Creating : ${shellFolder}`);
    fs.mkdirSync(shellFolder);
  }
  fs.writeFileSync(path.resolve(shellFilePath), shellFile.join('\n'));
  return { removeSize, removeCount };
};

const filenameHash = file =>
  `${crypto.createHash('md5').update(file).digest('hex').replace('/', '-')}.json`;

const writeCacheFile = (data, cacheFolder) => {
  const folder = path.resolve(cacheFolder);
  if (!fs.existsSync(folder)) {
    logger.info(`Creating cache folder: ${folder}`);
    fs.mkdirSync(folder);
  }
  const cachePath = path.join(folder, filenameHash(data.file));
  logger.debug(`Writing cache file to :${cachePath}`);
  return fs.writeFileSync(cachePath, JSON.stringify(data));
};

const getCacheFile = (file, folder) => {
  const fileHash = filenameHash(file);
  const filePath = path.join(path.resolve(folder), fileHash);
  if (!fs.existsSync(filePath)) {
    logger.debug(`No cache found: ${filePath}`);
    return false;
  }
  logger.debug(`Found cache: ${chalk.cyan(path.join(folder, fileHash))}`);
  return JSON.parse(fs.readFileSync(filePath));
};

module.exports = {
  getTargetFiles,
  getFileSizes,
  buildShellFile,
  writeCacheFile,
  getCacheFile
};
