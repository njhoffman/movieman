const _ = require('lodash');

const getTitleMap = (targetFiles, extensions) => {
  const titleMap = {};
  targetFiles.forEach(file => {
    const ext = file.split('.').pop();
    const title = file.split('/').pop().replace(`.${ext}`, '');
    if (extensions.includes(ext)) {
      titleMap[title] = [].concat(titleMap[title], file).filter(Boolean);
    }
  });
  return titleMap;
};

const getDupes = titleMap => {
  const dupes = _.pickBy(titleMap, title => title.length > 1);
  const dupesCount = _.reduce(
    _.keys(dupes),
    (prev, curr, i) => {
      return prev + dupes[curr].length;
    },
    0
  );
  return { dupes, dupesCount };
};

module.exports = {
  getTitleMap,
  getDupes
};
