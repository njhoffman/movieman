const _ = require('lodash');
const chalk = require('chalk');
const pb = require('pretty-bytes');

const getVideoMetadata = require('../metadata');
const { getTargetFiles, getFileSizes, buildShellFile } = require('../files');
const config = require('../../config');
const { outputAll, getLogger } = require('../logger');
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
  logger.info(`Getting stats from: ${directories.length} base directories`);
  const targetFiles = _.flatten(_.map(directories, processDirectory));

  const titleMap = getTitleMap(targetFiles, extensions);
  const { dupes, dupesCount } = getDupes(titleMap);
  logger.info(`Found ${dupesCount} duplicates for ${_.keys(dupes).length} titles`);

  const progress = { total: dupesCount, curr: 0 };

  const dupesMetadata = [];
  dupesMetadata.push(
    await _.keys(dupes).reduce(async (prevPromise, dupeName) => {
      dupesMetadata.push(await prevPromise);
      return Promise.all([dupeName, await getMetadata(dupes[dupeName], progress)]);
    }, Promise.resolve())
  );

  _.remove(dupesMetadata, _.isEmpty);

  // sort to indicate which videos to keep
  _.each(dupesMetadata, ([title, files]) =>
    files.sort((a, b) => {
      if (a.video.width === b.video.width) {
        return a.bitrate < b.bitrate ? -1 : 1;
      } else if (a.video.width < b.video.width) {
        return -1;
      } else if (a.video.width > b.video.width) {
        return 1;
      }
      return 0;
    })
  );

  const { removeCount, removeSize } = buildShellFile(dupesMetadata);
  logger.info(`${chalk.cyan(removeCount)} duplicates => ${chalk.red(pb(removeSize))}`);

  stats.directories.forEach(dir => {
    logger.info(
      `${dir.path} => ${chalk.cyan(dir.files.length)} files, ${chalk.green(pb(dir.total))}`
    );
  });
};

module.exports = statsCommand;
