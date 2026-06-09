module.exports.withRetry = async (fn, retries = 5) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const code = err.parent?.code ?? err.original?.code ?? err.code;
      if (code === '40001' && attempt < retries - 1) {
        const delay = 50 * Math.pow(2, attempt) + Math.floor(Math.random() * 50);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
};

module.exports.progressBar = (current, total, show, options = {}) => {
  const { length = 20, filledChar = '█', emptyChar = '░', showPercent = show == true ?  true : false } = options;
  const percent = Math.max(0, Math.min(1, current / total));
  const filled = Math.round(length * percent);
  const empty = length - filled;
  const bar = `${filledChar.repeat(filled)}${emptyChar.repeat(empty)}`;
  return showPercent ? `[${bar}] ${Math.round(percent * 100)}%` : `[${bar}]`;
};

module.exports.numberFormat = (number, decimal) => {
  return number.toLocaleString('en-US', { minimumFractionDigits: decimal, maximumFractionDigits: decimal }); 
};

module.exports.randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.percent = (value, max) => {
  return Math.floor((value / max) * 100);
};