const _ = require('lodash');
const Promise = require('bluebird');
const getVideoMetadata = require('../metadata');
const { getTargetFiles, buildShellFile, sortDupes } = require('../files');
const config = require('../../config');
const logger = require('../logger');
const { getDupes, getTitleMap } = require('./common');

const dupeScanCommand = async options => {
  const { directories, extensions } = config.library;
  const { all, verbose } = options;

  const targetFiles = [];
  logger.info(`Getting duplicate filenames from: ${directories.length} base directories`);

  directories.forEach(dir => {
    targetFiles.push(...getTargetFiles(dir, { recursive: true }));
  });

  const titleMap = getTitleMap(targetFiles, extensions);
  const { dupes, dupesCount } = getDupes(titleMap);
  logger.info(
    `Found ${dupesCount} duplicates for ${_.keys(dupes).length} titles, scanning metadata...`
  );

  const allResults = await Promise.map(dupeFiles, dupe => getVideoMetadata(dupe, progress), {
    concurrency: 4
  });
  _.remove(dupesMetadata, _.isEmpty);
  const sortedDupes = sortDupes(dupesMetadata);
  const { removeCount, removeSize } = buildShellFile(sortedDupes);

  logger.info(`Finished: ${removeCount} to remove, ${removeSize}`);

  if (all) {
    logger.outputAll(allResults);
  } else if (verbose) {
    logger.outputVerbose(allResults);
  } else {
    logger.outputTable(allResults);
  }

  logger.info(`\nFinished ${targetFiles.length} files\n`);
};

module.exports = dupeScanCommand;
