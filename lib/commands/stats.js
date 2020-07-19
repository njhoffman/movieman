const _ = require('lodash');
const getVideoMetadata = require('../metadata');
const getTargetFiles = require('../files');
const config = require('../../config');
const logger = require('../logger');
const { getDupes, getTitleMap } = require('./common');

const statsCommand = async (cmd, options) => {
  const { directories, extensions } = config.dupescan;
  const targetFiles = [];
  logger.info(`Getting stats from: ${directories.length} base directories`);
  directories.forEach(dir => {
    targetFiles.push(...getTargetFiles(dir, { recursive: true }));
  });

  const titleMap = getTitleMap(targetFiles, extensions);
  const { dupes, dupesCount } = getDupes(titleMap);
  logger.info(`Found ${dupesCount} duplicates for ${_.keys(dupes).length} titles`);
};

module.exports = statsCommand;
