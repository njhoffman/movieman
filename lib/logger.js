const logger = require('loglevel');
const prefix = require('loglevel-plugin-prefix');
const chalk = require('chalk');
const util = require('util');

const config = require('../config');

const { padRight, humanMemorySize } = require('./utils');

const inspect = obj => util.inspect(obj, { colors: true, depth: 10 });

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red
};

prefix.reg(logger);
logger.setLevel(config.logLevel);

prefix.apply(logger, {
  format: (level, name, timestamp) =>
    `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
      padRight(level, 5)
    )} ${chalk.green(`${name}:`)}`
});

prefix.apply(logger.getLogger('critical'), {
  format: (level, name, timestamp) => chalk.red.bold(`[${timestamp}] ${level} ${name}:`)
});

const outputAll = results => {
  results.forEach(result => {
    const { file, general, video, audio } = result;
    logger.info(`${file}:`);
    logger.info(`  ${inspect(general).split('\n').join('\n  ')}`);
    logger.info(`  ${inspect(video).split('\n').join('\n  ')}`);
    audio.forEach(audioStream => {
      logger.info(`  ${inspect(audioStream).split('\n').join('\n  ')}`);
    });
  });
};

const outputVerbose = results => {
  results.forEach(result => {
    const { file, general, video, audio } = result;
    logger.info(
      [
        '\n',
        `  ${padRight(chalk.gray(file), 35)}`,
        padRight(chalk.cyan(humanMemorySize(general.FileSize, true)), 20),
        padRight(chalk.blueBright(humanMemorySize(general.OverallBitRate)), 10),
        `${(general.Duration / 60).toFixed(0)} min`
      ].join('  ')
    );

    const videoFormat = `${video.Format} (${video.CodecID})`;
    const videoSize = `${video.Width}x${video.Height}-${video.DisplayAspectRatio}`;
    logger.info(
      [
        `      ${padRight(chalk.blue(videoFormat), 33)}`,
        `${padRight(videoSize, 20)}`,
        `${padRight(video.BitRate ? humanMemorySize(video.BitRate) : '---', 10)}`,
        `${video.FrameRate} fps`
      ].join('  ')
    );

    audio.forEach(audioStream => {
      const audioFormat = `${audioStream.Format} (${audioStream.CodecID})`;
      logger.info(
        [
          `      ${padRight(chalk.blue(audioFormat), 33)}`,
          padRight(`${audioStream.Channels} channels`, 20),
          `${padRight(humanMemorySize(audioStream.SamplingRate), 10)}`
        ].join('  ')
      );
    });
  });
};

const outputTable = results => {
  logger.info('TABLE', results);
};

module.exports = { ...logger, outputTable, outputVerbose, outputAll };
