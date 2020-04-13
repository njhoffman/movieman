module.exports = {
  search: '1982',
  scraper: {
    url: 'https://thepiratebays.info/search',
    // filters for only hd movies
    urlSuffix: '99/207',
    // urlSuffix: '7/200',
    minSeeders: 1,
    fetchInterval: 3000
  },
  filter: {
    existing: ['/mnt/e/Sorted/Movies'],
    minSeeders: 1,
    exclude: '720p'
  },
  writer: {
    outputFolder: '.torrents',
    historyFile: 'torrents.json'
  }
};
