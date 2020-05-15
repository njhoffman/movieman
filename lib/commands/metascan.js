const _ = require('lodash');
const chalk = require('chalk');

const logger = require('../logger');
const getTargetFiles = require('../files');
const getVideoMetadata = require('../metadata');

const metaScanCommand = async (mainTarget, additionalTargets, options) => {
  const { all, verbose } = options;
  const targets = [].concat(mainTarget, additionalTargets);
  const targetFiles = [];
  targets.forEach(target => {
    targetFiles.push(...getTargetFiles(target));
  });

  logger.info(`Scanning metainfo for ${chalk.cyan(targetFiles.length)} files`);

  const progress = { total: targets.length, curr: 0 };
  const allResults = await Promise.all(
    targets.map(async target => getVideoMetadata(target, progress, all))
  );

  if (all) {
    logger.outputAll(allResults);
  } else if (verbose) {
    logger.outputVerbose(allResults);
  } else {
    logger.outputTable(allResults);
  }

  logger.info(`\nFinished ${targetFiles.length} files\n`);
};

module.exports = metaScanCommand;
