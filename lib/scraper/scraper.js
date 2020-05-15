const _ = require('lodash');
const { spawn } = require('child_process');
const chalk = require('chalk');
const { parse } = require('node-html-parser');
const sleep = require('util').promisify(setTimeout);
// const getHTML = require('html-get');

// TODO:
//  - replace searchTerm with searchYears
//  - add optional additional search query (do OR's work?)
//  - output magnet files by years .magnets/year/title.uri
//  - output magnet files optionally by range of seeders
//  phase two:
//   - resolve title with filebot
//   - check if exists, only add if filesize is larger

const strToBytes = str => {
  const [num, unit] = str.split('&nbsp;');
  if (unit === 'GiB') {
    return parseFloat(num, 10) * 1000;
  }
  return parseFloat(num, 10);
};

const getHTML = url =>
  new Promise((resolve, reject) => {
    const args = [url, '-s'];
    const curl = spawn('curl', args);
    let outputData = '';
    curl.stdout.on('data', data => {
      outputData += data;
    });

    curl.stderr.on('data', data => {
      console.log('Error Data', data.toString());
      reject(new Error(data));
    });

    curl.on('close', () => resolve({ html: outputData }));
  });

const parseRow = row => {
  if (!row.querySelector('.detName')) {
    return null;
  }

  const size = strToBytes(row.querySelector('.detDesc').rawText.match(/Size ([^,]+),/)[1]);

  return {
    name: row.querySelector('.detName a').rawText,
    torrentLink: row.querySelectorAll('a')[2].attributes.href,
    magnetLink: row.querySelectorAll('a')[3].attributes.href,
    seeders: parseInt(row.querySelectorAll('td')[2].rawText, 10),
    leechers: parseInt(row.querySelectorAll('td')[3].rawText, 10),
    size
  };
};

const parseHtml = html => {
  const parsedHtml = parse(`${html}`);
  // #SearchResults #content #main-content table#searchResult tbody tr
  const searchResults = parsedHtml.querySelector('#searchResult');
  if (!searchResults) {
    throw new Error('No search results found');
  }
  return searchResults.querySelectorAll('tr').map(parseRow).filter(Boolean);
};

const startScraper = async (search, config) => {
  const { url, urlSuffix, minSeeders, fetchInterval } = config;
  const results = [];
  let seedCount = minSeeders + 1;
  let pageCount = 1;
  let lastFetch = new Date().getTime();

  /* eslint-disable no-await-in-loop */
  while (seedCount >= minSeeders) {
    const searchUrl = `${url}/${search}/${pageCount}/${urlSuffix}`;
    const intervalWait = fetchInterval - (new Date().getTime() - lastFetch);

    // const html = await promisify(fs.readFile)(path.join(__dirname, 'mocksite.html'));
    console.log(`Scraping page in ${intervalWait / 1000}s: ${chalk.cyan(searchUrl)}`);
    await sleep(intervalWait > 0 ? intervalWait : 0);
    const { html } = await getHTML(searchUrl);
    lastFetch = new Date().getTime();

    console.log(`  --parsing results: ${html.length} bytes`);
    const parsedResults = parseHtml(html);
    seedCount = _.last(parsedResults).seeders || 0;
    pageCount += 1;
    results.push(parsedResults);
  }
  /* eslint-disable no-await-in-loop */

  return _.flatten(results).filter(Boolean);
};

module.exports = startScraper;
