const PrettyError = require('pretty-error');
const { program } = require('commander');

const { version, name } = require('../package');
const scraperCommand = require('./commands/scraper');
const statsCommand = require('./commands/stats');
const dupeScanCommand = require('./commands/dupescan');
const metaScanCommand = require('./commands/metascan');
const logger = require('./logger');

const pe = new PrettyError();

program.name(name).version(version);

program
  .command('scrape <searchTerm>')
  .description('Scrape torrent search for <searchTerm>')
  .action(scraperCommand);

program
  .command('metascan <target> [additionalTargets...]')
  .alias('meta')
  .description('Scan and display mediainfo of one or more video files')
  .option('-v, --verbose', 'Print detailed output instead of concise table')
  .option('-a, --all', 'Print all fields available')
  .action(metaScanCommand)
  .on('--help', () => {
    logger.info('\n', 'Examples:', '\n');
    logger.info('  $ mm meta ./*');
    logger.info('  $ mm meta ./videoFile1.mkv');
  });

program
  .command('dupescan')
  .alias('dupes')
  .description('Scan and report media info of duplicated titles')
  .option('-v, --verbose', 'Print detailed output instead of concise table')
  .option('-a, --all', 'Print all fields available')
  .action(dupeScanCommand);

program
  .command('statistics')
  .alias('stats')
  .description('Display information about duplicates and size for movie library')
  .action(statsCommand);

program.exitOverride();

try {
  logger.debug(process.argv);
  program.parse(process.argv);
} catch (err) {
  if (err.message === '(outputHelp)') {
    process.exit(0);
  }
  logger.info(pe.render(err));
  process.exit(1);
}

process.on('unhandledRejection', err => {
  logger.info('Unhandled Rejection', pe.render(err));
  process.exit(1);
});

process.on('unhandledException', err => {
  logger.info('Unhandled Exception', pe.render(err));
  process.exit(1);
});
