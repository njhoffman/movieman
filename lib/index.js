const PrettyError = require('pretty-error');
const startScraper = require('./scraper');

const config = require('../config');

(async () => {
  const searchTerm = '1964';

  const results = await startScraper(searchTerm, config.scraper);
  const filtered = results.filter(result => result.seeders >= config.scraper.minSeeders);

  console.log('\n', filtered, '\n', filtered.length, '\n****');
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
//  - replace html-get with curl
//  - replace searchTerm with searchYears
//  - add optional additional search query (do OR's work?)
//  - find out tixati magnet format
//  - output magnet files by years
//  - output magnet files optionally by range of seeders
//  phase two:
//   - resolve title with filebot
//   - check if exists, only add if filesize is larger
