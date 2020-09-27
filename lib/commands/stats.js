const _ = require('lodash');
const chalk = require('chalk');
const pb = require('pretty-bytes');
const Promise = require('bluebird');

const getVideoMetadata = require('../metadata');
const { getTargetFiles, getFileSizes, sortDupes, buildShellFile } = require('../files');
const config = require('../../config');
const { getLogger } = require('../logger');
const { getDupes, getTitleMap } = require('./common');

const logger = getLogger('stats');

const { directories, extensions } = config.library;

const stats = { total: 0, directories: [] };

const getMetadata = async (files, progress) => {
  return Promise.all(files.map(async filePath => getVideoMetadata(filePath, progress)));
};

const processDirectory = dir => {
  logger.debug(`Scanning ${dir}`);
  const dirFiles = getTargetFiles(dir, { recursive: true });

  logger.info(`Found ${chalk.cyan(dirFiles.length)} target files in ${dir}, retrieving sizes`);

  const sizedFiles = getFileSizes(dirFiles);
  stats.directories.push({
    path: dir,
    total: _.sumBy(sizedFiles, '[1]'),
    files: sizedFiles
  });
  return dirFiles;
};

const statsCommand = async (cmd, options) => {
  // TODO: don't lookup metadata, report back # of cached files
  logger.info(`Getting stats from: ${directories.length} base directories`);
  const targetFiles = _.flatten(_.map(directories, processDirectory));

  const titleMap = getTitleMap(targetFiles, extensions);
  const { dupes, dupesCount } = getDupes(titleMap);
  logger.info(`Found ${dupesCount} duplicates for ${_.keys(dupes).length} titles`);

  const dupeFiles = [];
  _.each(_.keys(dupes), dupeName => {
    _.each(dupes[dupeName], file => dupeFiles.push([dupeName, file]));
  });

  const progress = { total: dupeFiles.length, curr: 0 };
  const allResults = await Promise.map(
    dupeFiles,
    async ([title, file]) => getVideoMetadata({ title, file, progress }),
    { concurrency: 4 }
  );

  const sortedDupes = _.groupBy(allResults, 'title');

  const rev = 0;
  _.each(sortedDupes, (files, title) => {
    sortedDupes[title] = sortDupes(rev ? _.reverse(files) : files);
  });

  const { removeCount, removeSize } = buildShellFile(sortedDupes);
  logger.info(`${chalk.cyan(removeCount)} duplicates => ${chalk.red(pb(removeSize))}`);
  stats.directories.forEach(dir => {
    logger.info(
      `${dir.path} => ${chalk.cyan(dir.files.length)} files, ${chalk.green(pb(dir.total))}`
    );
  });
};

module.exports = statsCommand;
