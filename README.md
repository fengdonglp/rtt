# audio-to-text

> Using Baidu speech recognition module to realize voice to text conversion

## Dependencies
* [fluent-ffmpeg](http://ffmpeg.org/ "ffmpeg") ffmpeg download url：[http://ffmpeg.org/download.html](http://ffmpeg.org/download.html)
* [baidu-aip-sdk](https://github.com/Baidu-AIP/nodejs-sdk) Official document：[http://ai.baidu.com/docs#/ASR-Online-Node-SDK/top](http://ai.baidu.com/docs#/ASR-Online-Node-SDK/top)
  You need to register and create speech recognition applications on Baidu AI open platform.

## Installation

``` shell
$ npm install audio-to-text
```

## Usage

``` javascript
const Att  = require('audio-to-text');

// baidu AI application configuration information
const baiduConfig = {
  "APP_ID": "your APP_ID",
  "API_KEY": "your API_KEY",
  "SECRET_KEY": "your SECRET_KEY"
}

const speech = new Att(baiduConfig);
const file_path = 'your file path';

speech.audio2Text(file_path).then(text => {
  console.log(text);
}).catch(console.log.bind(console));
```

## Questions

* If the audio quality is too poor, Baidu speech will not be recognized, so the transformation result may be empty.