const Ff = require('./utils/ffmpeg');
const ff = new Ff();
const AipSpeechClient = require("baidu-aip-sdk").speech;
const { APP_ID, API_KEY, SECRET_KEY }  = require('./config/baidu_sdk.json');

ff.input('./output/record/record0.m4a')
  .metadata()
  .then(res => {
    console.dir(res);
  });

// 新建一个对象，建议只保存一个对象调用服务接口
const client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);

client.recognize(speech, format, 16000, {cuid: Math.random()});
