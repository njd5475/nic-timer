#!/usr/bin/env node
const moment = require('moment');
const math = require('mathjs');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const player = require('play-sound')();

const time = async function(delay) {
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
      await player.play(config.sound);
    }
  };
  
  setTimeout(timeout, 1000);
};

const { argv } = require('yargs')
  .usage('Usage: $0 [options] <exp>')
  .command('$0 <exp>', 'The number of seconds or math expression of seconds to wait.', () => {}, async ({exp}) => {
    return await time(exp);
  })
  .option('config', {alias: 'c', describe: 'Configuration file for sound to play', command: '$0 <file>'})
  .help('h')
  .alias('h', 'help');

const config = require('./config.json');
const yargs = require('yargs');

console.log(argv);
if(argv.config || !config.sound) {
  inDoMode = false;
  (async function() {
    console.log("Config saved");
    
    const { Select } = require('enquirer');
    const fs = require('fs');
    const { promisify } = require('util');
    const readdirp = promisify(fs.readdir);
    const write = promisify(fs.writeFile);
    let files = await readdirp('./music');
    
    const prompt = new Select({
      name: 'value',
      message: 'Pick a alarm sound',
      choices: files,
    });
    
    const sound = await prompt.run();
    console.log(`Changing sound from ${config.sound} to ${sound}`);
    config.sound = `./music/${sound}`;
    await write("./config.json", JSON.stringify(config, null, "   "));
    process.exit();
  })();
}
