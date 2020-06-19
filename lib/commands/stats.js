const _ = require('lodash');
const chalk = require('chalk');
const pb = require('pretty-bytes');

const getVideoMetadata = require('../metadata');
const { getTargetFiles, getFileSizes } = require('../files');
const config = require('../../config');
const logger = require('../logger').getLogger('stats');
const { getDupes, getTitleMap } = require('./common');

const { directories, extensions } = config.library;

const stats = { total: 0, directories: [] };

const getDupeMetadata = async (dupeFiles, progress) => {
  Promise.all(dupeFiles.map(async filePath => getVideoMetadata(filePath, progress)));
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
  logger.info(`Getting stats from: ${directories.length} base directories`);
  const targetFiles = _.flatten(_.map(directories, processDirectory));

  const titleMap = getTitleMap(targetFiles, extensions);
  const { dupes, dupesCount } = getDupes(titleMap);
  logger.info(`Found ${dupesCount} duplicates for ${_.keys(dupes).length} titles`);

  const progress = { total: dupesCount, curr: 0 };
  const dupeMetaFetch = [];
  _.keys(dupes).forEach(dupeName => {
    logger.debug(`Retrieving video info for ${dupes[dupeName].length} files`);
    dupeMetaFetch.push(getDupeMetadata(dupes[dupeName], progress));
  });

  const dupeMetadata = await Promise.all(dupeMetaFetch);
  console.log('DUPES', dupeMetadata);

  stats.directories.forEach(dir => {
    logger.info(
      `${dir.path} => ${chalk.cyan(dir.files.length)} files, ${chalk.green(pb(dir.total))}`
    );
  });
};

module.exports = statsCommand;
