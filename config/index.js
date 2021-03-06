module.exports = {
  logLevel: 'trace',
  cache: {
    folder: '.data/cache',
    enabled: true
  },
  shellFilePath: '.data/dupes.sh',
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
      outputFolder: '.data/torrents',
      historyFile: 'torrents.txt'
    }
  },
  library: {
    // directories: ['/mnt/H_Movies/Temp'],
    directories: ['/mnt/D_System/Sorted/Movies', '/mnt/H_Movies/Sorted/Movies'],
    // directories: ['.data/movies/1', '.data/movies/2'],
    extensions: ['mp4', 'mkv', 'wmv', 'avi', 'm4v']
  }
};
