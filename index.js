#!/usr/bin/env node
const moment = require('moment');
const math = require('mathjs');
const path = require('path');
const { loadConfig, reconfigure } = require('./lib/config');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const player = require('play-sound')();

const time = async function(config, delay) {
  const toHuman = (counter) => moment.duration(counter, "seconds").format("h [hrs], m [min], s [secs]")
  const TIMER = math.evaluate(delay);
  console.log(`Alarm in ${toHuman(TIMER)} seconds`);
  let counter = TIMER;
  
  timeout = async () => {
    counter -= 1;
    console.log(`Time ${toHuman(counter)}`);
    if(counter > 0) {
      setTimeout(timeout, 1000);
    } else {
      await player.play(path.join(config.sound));
    }
  };
  
  setTimeout(timeout, 1000);
};

const { argv } = require('yargs')
  .usage('Usage: $0 [options] <exp>')
  .command('$0 <exp>', 'The number of seconds or math expression of seconds to wait.', () => {}, async ({exp}) => {
    const config = await loadConfig();
    return await time(config, exp);
  })
  .command({alias: 'c', describe: 'Configuration file for sound to play', command: 'config',
    handler: async () => {
      await reconfigure();
    }
  })
  .help('h')
  .alias('h', 'help');
