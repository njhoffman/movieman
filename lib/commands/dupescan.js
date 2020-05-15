const _ = require('lodash');
const getVideoMetadata = require('../metadata');
const getTargetFiles = require('../files');
const config = require('../../config');
const logger = require('../logger');

const dupeScanCommand = async (cmd, options) => {
  const { directories, extensions } = config.dupescan;

  const targetFiles = [];
  logger.info(`Getting duplicates from $:{directories.length} base directories`);

  directories.forEach(dir => {
    targetFiles.push(...getTargetFiles(dir, { recursive: true }));
  });

  const titleMap = {};
  targetFiles.forEach(file => {
    const ext = file.split('.').pop();
    const title = file.split('/').pop().replace(`.${ext}`, '');
    if (extensions.includes(ext)) {
      titleMap[title] = [].concat(titleMap[title], file).filter(Boolean);
    }
  });
  const dupes = _.pickBy(titleMap, title => title.length > 1);
  const dupesCount = _.reduce(
    _.keys(dupes),
    (prev, curr, i) => {
      return prev + dupes[curr].length;
    },
    0
  );
  logger.info(`Found ${dupesCount} duplicates for ${_.keys(dupes).length} titles`);
};

module.exports = dupeScanCommand;
