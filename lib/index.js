const startScraper = require('./scraper');

const config = require('../config');

(async () => {
  const searchTerm = '1963';

  const results = await startScraper(searchTerm, config.scraper);

  console.log('\n\n', results.length, '\n****', results);
})();
