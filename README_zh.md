# audio-to-text

> 利用百度语音识别SDK实现录音转文字

## 前提

### 依赖
* [ffmpeg](http://ffmpeg.org/ "ffmpeg") 使用前必须安装ffmpeg，下载地址：[http://ffmpeg.org/download.html](http://ffmpeg.org/download.html)
* [baidu-aip-sdk](https://github.com/Baidu-AIP/nodejs-sdk) 官方文档：[http://ai.baidu.com/docs#/ASR-Online-Node-SDK/top](http://ai.baidu.com/docs#/ASR-Online-Node-SDK/top)
  需要现在百度AI平台注册并创建语音识别应用

## 安装

``` shell
$ npm install audio-to-text
```

## 使用

``` javascript
const Att  = require('audio-to-text');

// 百度AI开放平台应用配置
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

## 问题

* 如果音频质量过差，百度语音会无法识别，所以转化结果可能为空。