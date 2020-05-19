module.exports = {
  scraper: {
    site: {
      url: 'https://thepiratebays.info/search',
      // filters for only hd movies
      urlSuffix: '99/207',
      // urlSuffix: '7/200',
      minSeeders: 1,
      fetchInterval: 1500
    },
    filter: {
      existing: ['/mnt/e/Sorted/Movies'],
      minSeeders: 2,
      exclude: '720p'
    },
    writer: {
      outputFolder: '.torrents',
      historyFile: 'torrents.txt'
    }
  },
  dupescan: {
    directories: ['/mnt/D_System/Sorted/Movies', '/mnt/H_Movies/Sorted/Movies'],
    extensions: ['mp4', 'mkv', 'wmv', 'avi', 'm4v']
  }
};
