#!/usr/bin/env node
const { argv } = require('yargs');
const moment = require('moment');
const math = require('mathjs');
const momentDurationFormatSetup = require("moment-duration-format");
const player = require('play-sound')();

const config = require('./config.json');
momentDurationFormatSetup(moment);

let inDoMode = true;

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


if(inDoMode) {
  (async function() {
    const TIMER = math.evaluate(process.argv[2]);
    console.log(TIMER);
    let counter = TIMER;

    timeout = async () => {
      counter -= 1;
      console.log(`Time ${moment.duration(counter, "seconds").format("h [hrs], m [min], s [secs]")}`);
      if(counter > 0) {
        setTimeout(timeout, 1000);
      } else {
        await player.play(config.sound);
      }
    };

    setTimeout(timeout, 1000);
  })();
}
