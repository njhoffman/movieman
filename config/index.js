module.exports = {
  scraper: {
    url: 'https://thepiratebays.info/search',
    urlSuffix: '99/207',
    // urlSuffix: '7/200',
    fetchInterval: 3000,
    minSeeders: 3,
    outputPath: '.cache/files.json'
  },
  existing: ['/mnt/e/Sorted/Movies']
};
