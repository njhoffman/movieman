const { startScraper, writeTorrents } = require('../scraper');
const config = require('../../config');
const logger = require('../logger');

const filterResults = ({ minSeeders, exclude }) => result => {
  return result.seeders >= minSeeders && !result.name.includes(exclude);
};

const scraperCommand = async (cmd, env) => {
  const { searchTerm } = env;
  const { site, filter, writer } = config.scraper;

  const results = await startScraper(searchTerm, site);

  const filtered = results.filter(filterResults(filter));

  const writeResults = await writeTorrents(filtered, searchTerm, writer);
  logger.info(`\nFinished writing ${writeResults.length} torrents`);
};

module.exports = scraperCommand;
