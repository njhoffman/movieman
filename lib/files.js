const glob = require('glob');
const path = require('path');
const { statSync } = require('fs');

const checkExists = target => {
  try {
    const stat = statSync(target);
    return stat;
  } catch {
    return false;
  }
};

const getTargetFiles = (target, options = {}) => {
  const { recursive = false } = options;
  const exists = checkExists(target);
  if (exists && exists.isFile()) {
    return [path.resolve(target)];
  } else if (exists && exists.isDirectory()) {
    const globPath = recursive ? `${target}/**/*` : `${target}/*`;
    return glob.sync(globPath);
  }
  return [];
};

module.exports = getTargetFiles;
