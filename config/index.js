module.exports = {
  scraper: {
    url: 'https://thepiratebay.org/search',
    // pageSuffix: '/0/7/200',
    urlSuffix: '7/200',
    fetchInterval: 3000,
    minSeeders: 3,
    outputPath: '.cache/files.json'
  },
  existing: ['/mnt/e/Sorted/Movies']
};
