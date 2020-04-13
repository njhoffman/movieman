const PrettyError = require('pretty-error');

const startScraper = require('./scraper');
const writeTorrents = require('./writer');
const config = require('../config');

const filterResults = ({ minSeeders, exclude }) => result => {
  return result.seeders >= minSeeders && !result.name.includes(exclude);
};

(async () => {
  const { search, scraper, filter, writer } = config;

  const results = await startScraper(search, scraper);

  const filtered = results.filter(filterResults(filter));
  console.log(filtered);

  const writeResults = await writeTorrents(filtered, search, writer);
  console.log(`\nFinished writing ${writeResults.length} torrents`);
})();

const pe = new PrettyError();
process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection', pe.render(err));
  process.exit(1);
});

process.on('unhandledException', err => {
  console.log('Unhandled Exception', pe.render(err));
  process.exit(1);
});

// TODO:
//  - replace searchTerm with searchYears
//  - add optional additional search query (do OR's work?)
//  - output magnet files by years .magnets/year/title.uri
//  - output magnet files optionally by range of seeders
//  phase two:
//   - resolve title with filebot
//   - check if exists, only add if filesize is larger
