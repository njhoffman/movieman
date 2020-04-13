const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const _ = require('lodash');
const url = require('url');

const writeTorrent = folder => async torrent => {
  const torrentName = _.last(torrent.torrentLink.split('/'));
  const filePath = `${path.join(folder, torrentName)}.url`;
  console.log(`Writing: ${filePath.replace(folder, '')}`);
  await promisify(fs.writeFile)(filePath, torrent.magnetLink);
  return filePath.replace(`${folder}/`, '');
};

const writeHistory = (search, results, historyPath) => {
  let existing = {};
  if (fs.existsSync(historyPath)) {
    existing = JSON.parse(fs.readFileSync(historyPath).toString());
  }
  const history = {
    [search]: results.map(res => res.replace('.url', '')),
    ...existing
  };
  return fs.writeFileSync(historyPath, JSON.stringify(history));
};

const writeTorrents = async (torrents, search, config) => {
  const folder = path.resolve(path.join(config.outputFolder, search));

  if (!fs.existsSync(folder)) {
    console.log(`Creating folder: ${folder}`);
    fs.mkdirSync(folder, { recursive: true });
  }

  const results = await Promise.all(torrents.map(writeTorrent(folder)));
  const historyPath = path.join(config.outputFolder, config.historyFile);
  writeHistory(search, results, historyPath);
  return results;
};

module.exports = writeTorrents;
