const PrettyError = require('pretty-error');
const { program } = require('commander');

const { version, name } = require('../package');
const scraperCommand = require('./commands/scraper');
const dupeScanCommand = require('./commands/dupescan');
const metaScanCommand = require('./commands/metascan');

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
    console.log('\n', 'Examples:', '\n');
    console.log('  $ mm meta ./*');
    console.log('  $ mm meta ./videoFile1.mkv');
  });

program
  .command('dupescan')
  .alias('dupes')
  .description('Scan and report media info of duplicated titles')
  .action(dupeScanCommand);

program.parse(process.argv);

const pe = new PrettyError();
process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection', pe.render(err));
  process.exit(1);
});

process.on('unhandledException', err => {
  console.log('Unhandled Exception', pe.render(err));
  process.exit(1);
});
