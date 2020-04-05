const _ = require('lodash');
const { spawn } = require('child_process');
const chalk = require('chalk');
const { parse } = require('node-html-parser');
// const getHTML = require('html-get');

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
      console.log('STDOUT data', data.toString());
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
  return searchResults.querySelectorAll('tr').filter(Boolean).map(parseRow);
};

const startScraper = async (searchTerm, { url, urlSuffix, minSeeders }) => {
  const results = [];
  let seedCount = minSeeders + 1;
  let pageCount = 1;
  /* eslint-disable no-await-in-loop */
  while (seedCount >= minSeeders) {
    const searchUrl = `${url}/${searchTerm}/${pageCount}/${urlSuffix}`;
    // const html = await promisify(fs.readFile)(path.join(__dirname, 'mocksite.html'));
    console.log(`Scraping page: ${chalk.cyan(searchUrl)}`);
    const { html } = await getHTML(searchUrl);
    console.log(`  --parsing results: ${html.length} bytes`);
    console.log('HTML', html);
    const parsedResults = parseHtml(html);
    seedCount = _.get(parsedResults[parsedResults.length - 1], 'seeders') || 0;
    pageCount += 1;
    results.push(parsedResults);
  }
  /* eslint-disable no-await-in-loop */
  return _.flatten(results).filter(Boolean);
};

module.exports = startScraper;
