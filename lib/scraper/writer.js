const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const _ = require('lodash');
const url = require('url');

const { humanMemorySize, padZeros, padRight } = require('../utils');

const writeTorrent = folder => async torrent => {
  const torrentName = _.last(torrent.torrentLink.split('/'));
  const fileName = `${torrentName}.url`;
  const filePath = path.join(folder, fileName);
  console.log(`Writing: ${filePath.replace(folder, '')}`);
  await promisify(fs.writeFile)(filePath, torrent.magnetLink);
  return { ...torrent, fileName };
};

const writeHistory = (search, results, historyPath) => {
  return fs.writeFileSync(
    historyPath,
    results
      .map(result =>
        [
          `${padRight(padZeros(result.seeders, 2), 3)}`,
          `${padRight(humanMemorySize(result.size * 1024), 10)}`,
          `${result.fileName}`
        ].join('\t')
      )
      .join('\n')
  );
};

const writeTorrents = async (torrents, search, config) => {
  const folder = path.resolve(path.join(config.outputFolder, search));

  if (!fs.existsSync(folder)) {
    console.log(`Creating folder: ${folder}`);
    fs.mkdirSync(folder, { recursive: true });
  }

  const results = await Promise.all(torrents.map(writeTorrent(folder)));
  const historyPath = path.join(folder, config.historyFile);
  writeHistory(search, _.sortBy(results, 'name'), historyPath);
  return results;
};

module.exports = writeTorrents;
