const stripAnsi = require('strip-ansi');

/* eslint-disable no-octal */
const resetColor = '\x1B[0m';

const padLeft = (inputStr, len) => {
  const strLen = stripAnsi(inputStr).length;
  const str = strLen >= len ? inputStr.slice(0, strLen - len - 1) : inputStr;
  return len > strLen ? new Array(len - strLen + 1).join(' ') + str : str.slice(0, len - 1);
};

const padRight = (inputStr, len) => {
  const strLen = stripAnsi(inputStr).length;
  const ansiLen = inputStr.length - strLen;
  const str = strLen >= len ? `${inputStr.slice(0, len + ansiLen - 8)}...${resetColor}` : inputStr;
  return len > strLen ? str + new Array(len - strLen + 1).join(' ') : str;
};

const padZeros = (num, numZeros) => (Array(numZeros).join('0') + num).slice(-numZeros);

const humanMemorySize = (b, si) => {
  let bytes = Number(b);
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= thresh;
    u += 1;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
};

const requireUncached = module => {
  delete require.cache[require.resolve(module)];
  /* eslint-disable import/no-dynamic-require, global-require */
  return require(module);
  /* eslint-enable import/no-dynamic-require, global-require */
};

module.exports = { padLeft, padRight, padZeros, humanMemorySize, requireUncached };
