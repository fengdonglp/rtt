const BaiduSpeech  = require('./lib/BaiduSpeech');
const baidu  = require('./config/baidu_sdk.json');
const Ff = require('./lib/utils/ffmpeg');
const ff = new Ff();
const path = require('path');

const baiduSpeech = new BaiduSpeech(baidu);
const file_path = path.resolve(process.cwd(), './assets/recording.m4a');

baiduSpeech.audio2Text(file_path).then(text => {
  console.log(text);
}).catch(console.log.bind(console));
