const _ = require('lodash');
const chalk = require('chalk');

// const mockResults = require('./mockResults');
const { requireUncached } = require('./utils');
const logger = require('./logger');

const getVideoMetadata = async (file, progress, allFields) => {
  const mediainfo = requireUncached('node-mediainfo');
  logger.info(` -Retrieving metadata: ${chalk.yellow(file)}`);

  const metadata = await mediainfo(file);

  /* eslint-disable no-param-reassign */
  progress.curr += 1;
  logger.info(`  (${progress.curr}/${progress.total}) ${chalk.gray(file)}`);

  const generalMeta = _.find(metadata.media.track, { '@type': 'General' });
  const videoMeta = _.find(metadata.media.track, { '@type': 'Video' });
  const audioMetas = _.filter(metadata.media.track, { '@type': 'Audio' });

  // { OverallBitRate_Mode, CodecID, CodecID_Compatible, FrameCount, StreamSize, HeaderSize, FooterSize, Encoded_Date }
  const general = allFields
    ? generalMeta
    : _.pick(generalMeta, ['Format', 'FileSize', 'Duration', 'OverallBitRate', 'Framerate']);

  // { BitRate_Maximum, FrameRate_Mode, FrameCount, StreamSize, Format_Profile, BitDepth }
  const video = allFields
    ? videoMeta
    : _.pick(videoMeta, [
        'Format',
        'CodecID',
        'Duration',
        'BitRate',
        'Width',
        'Height',
        'DisplayAspectRatio',
        'FrameRate'
      ]);

  // { Duration, BitRate_Mode, ChannelPositions, ChannelLayout, Source_FrameCount, StreamSize, StreamSize_Proportion,
  const audio = allFields
    ? audioMetas
    : audioMetas.map(audioMeta =>
        _.pick(audioMeta, [
          'Format',
          'Format_AdditionalFeatures',
          'CodecID',
          'BitRate',
          'Channels',
          'SamplesPerFrame',
          'SamplingRate',
          'Sampling Count',
          'FrameRate',
          'FrameCount',
          'Default'
        ])
      );

  return { file, general, video, audio };
};

module.exports = getVideoMetadata;
