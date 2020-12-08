const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readdirp = promisify(fs.readdir);
const music = require('./music');

class ConfigLoader {

  get configPath() {
    return path.join(process.env.HOME, '.nic', 'config.json');
  }

  get musicDir() {
    return path.join(process.env.HOME, '.nic', 'music');
  }

  async getAvailableMusic() {
    let files = [];
    try {
      files = await readdirp(this.musicDir);
    }catch(e) {
      if(!fs.existsSync(this.musicDir)) {
        fs.mkdirSync(this.musicDir, { recursive: true });
        const preloadedMusic = path.join(__dirname, 'music');
        const toCopy = await readdirp(preloadedMusic);
        for(let f of toCopy) {
          fs.copyFileSync(path.join(preloadedMusic, f), path.join(this.musicDir, path.basename(f)));
        }
        files = await readdirp(this.musicDir);
      }
    }
    return files;
  }

  async reconfig(configPath, config) {
    console.log("Reconfiguring...");
    
    const { Select } = require('enquirer');

    const write = promisify(fs.writeFile);
    
    const files = await this.getAvailableMusic();
    
    if(files.length === 0) {
      console.log(`No music files to select please put some in ${this.musicDir}`);
    }

    const prompt = new Select({
      name: 'value',
      message: 'Pick a alarm sound',
      choices: files,
    });
    
    const sound = await prompt.run();
    if(sound) {
      console.log(`Changing sound from ${config.sound} to ${sound}`);
    }else{
      console.log(`Setting sound to ${sound}`);
    }
    config.sound = path.join(this.musicDir, sound);

    await write(this.configPath, JSON.stringify(config, null, "   "));

    return config;
  };
  
  async load() {
    const fs = require('fs');
    let config = {
      sound: undefined,
    };
    
    try {
      config = JSON.parse(fs.readFileSync(this.configPath).toString('utf-8'));
    }catch(e) {
      if(!fs.existsSync()) {
        config = await this.reconfig(this.configPath, {});
      }else{
        console.log('Unknown Error',e);
      }
    }
    return config;
  }

  static async loadConfig() {
    return await new ConfigLoader().load();
  }

  static async reconfigure() {
    const loader = new ConfigLoader();
    return await loader.reconfig(loader.configPath, await loader.load());
  }
}


module.exports = {
  loadConfig: ConfigLoader.loadConfig,
  reconfigure: ConfigLoader.reconfigure,
};