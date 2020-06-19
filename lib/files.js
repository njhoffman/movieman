const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const checkExists = target => {
  try {
    const stat = fs.statSync(target);
    return stat;
  } catch {
    return false;
  }
};

const getFileSizes = files =>
  files.map(file => {
    const stat = fs.statSync(file);
    return [file, stat.size];
  });

const getTargetFiles = (target, options = {}) => {
  const { recursive = false } = options;
  const exists = checkExists(target);
  if (exists && exists.isFile()) {
    return [path.resolve(target), exists.size];
  } else if (exists && exists.isDirectory()) {
    const globPath = recursive ? `${target}/**/*` : `${target}/*`;
    return glob.sync(globPath).filter(targetPath => fs.statSync(targetPath).isFile());
  }
  return [];
};

const sortDupes = dupes => {
  const sortedDupes = {};
  _.keys(dupes).forEach(dupeTitle => {
    sortedDupes[dupeTitle] = _.sortBy(dupes[dupeTitle], (a, b) => {
      console.log('SORTING', a, b);
      return 0;
    });
  });
  return sortedDupes;
};

const outputShellFile = dupes => {
  const shellFile = [
    '#!/bin/bash',
    '',
    '### dupe cleaner script',
    `### ran: ${new Date().toLocaleString()}`,
    ''
  ];

  _.keys(dupes).forEach(dupeTitle => {
    shellFile.push(`# ${dupeTitle}`);
    // dupes[dupeTitle].forEach(videoItem => {
    // }).
  });
};
// #!/bin/bash
//
// ### example output script
//
// # The Princess Bride (1987)
// #   /mnt/D_System/Sorted/Movies/The Princess Bride (1987)/The Princess Bride (1987).mkv
// #   /mnt/H_Movies/Sorted/Movies/The Princess Bride (1987)/The Princess Bride (1987).mkv
// #   /mnt/H_Movies/Sorted/Movies/The Princess Bride (1987)/The Princess Bride (1987).mp4'
//
// # *  D_System/.../The Princess Bride (1987).mkv   7.8 GB  18.5 MiB  1920x1080   119  min
// # -  H_Movies/.../The Princess Bride (1987).mkv   1.2 GB  2.1 MiB   1920x1040   119 min
// # -  H_Movies/.../The Princess Bride (1987).mp4   3.4 GB  5.4 Mib   1080x720    119 min
// #rm -v /mnt/H_Movies/Sorted/Movies/The Princess Bride (1987)/The Princess Bride (1987).mkv
// #rm -v /mnt/H_Movies/Sorted/Movies/The Princess Bride (1987)/The Princess Bride (1987).mp4

module.exports = { getTargetFiles, getFileSizes };
