const path = require('path');
const os = require('os');
const fs = require('fs');
const fi = require('./utils/file')();
const Ff = require('./utils/ffmpeg');
const ff = new Ff();
const AipSpeechClient = require("baidu-aip-sdk").speech;
const HttpClient = require("baidu-aip-sdk").HttpClient;

/**
 * BaiduSpeech
 *
 * @class
 * @constructor
 * @param {Object} options
 * @description options - options列表:
 *    APP_ID 百度AI开放平台创建应用的APP_ID
 *    API_KEY 百度AI开放平台创建应用的API_KEY
 *    SECRET_KEY 百度AI开放平台创建应用的SECRET_KEY
 *    segmentLength (单位：秒)语音分割时每段音频的时长，时长必须大于0并且小于60
 *    requestOptions request参数请参考 https://github.com/request/request#requestoptions-callback
 */
class ATT {
  constructor(options) {
    this.defaultOptions = {
      APP_ID: '',
      API_KEY: '',
      SECRET_KEY: '',
      segmentLength: 60,
      requestOptions: {}
    };

    if (options.segmentLengt) {
      if (!isNumber(options.segmentLength)) {
        throw new TypeError('"segmentLength" option should be a number type');
      } else if (options.segmentLength > 60 || options.segmentLength <= 0) {
        throw new RangeError('"segmentLength" option should be > 0 and <= 60');
      }
    }

    this.options = Object.assign(this.defaultOptions, options);
    this._init();
    this._initClient();
  }

  _init() {
    // 设置request库超时参数，值要设置大一点，因为百度语音识别会有一段时间才能识别出来
    HttpClient.setRequestOptions(
      Object.assign(
        {timeout: 50000},
        this.options.requestOptions
      )
    );
  }

  _initClient() {
    const { APP_ID, API_KEY, SECRET_KEY } = this.options;
    if (!APP_ID || !API_KEY || !SECRET_KEY) {
      throw new Error('APP_ID API_KEY SECRET_KEY can not be empty');
    } else {
      this.client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);
    }
  }

  /**
   * 音频转码 默认转码文件存在路径： 项目根目录/output/filename/pcm/ 
   * @param {String} file 文件路径
   * @return {Promise}
   */
  async _transcode(file) {
    try {
      const ext = path.extname(file);

      // 将文件按照step切割成若干份
      const dir = await ff.input(file).split(this.options.segmentLength);

      // 获取原音频文件切分后的所有文件
      const pattern = path.resolve(process.cwd(), dir, `*${ext}`);
      const originFiles = await fi.getFiles(pattern);

      // 返回所有转码后的pcm文件路径
      const pcmPath = await ff.transcode(originFiles);
      return await fi.getFiles(path.resolve(pcmPath, '*.pcm'));

    } catch (error) {
      throw error;
    }
  }

  /**
   * 用baidu SDK 转文字
   * @param {Buffer} buffer 需要转文字的音频文件流 
   * @return {Promise}
   */
  recognize(buffer) {
    return new Promise((resolve, reject) => {
      this.client.recognize(buffer, 'pcm', 16000, {})
        .then(res => {
          if (res.err_no === 0) {
            resolve(res.result);
          } else {
            reject(res.err_msg);
          }
        }, err => {
          reject(err);
        });
    })
  }

  /**
   * 将音频文件转换为
   * @param {String} file 文件路径
   * @return {Promise}
   */
  async audio2Text(file) {
    if (!fs.existsSync(file)) {
      throw new Error('The file does not exist');
    }

    try {
      const pcmFiles = await this._transcode(file);
      let textArray = [];

      for (let index = 0; index < pcmFiles.length; index++) {
        let pcm = pcmFiles[index];
        let buffer = new Buffer(fs.readFileSync(pcm));
        let text = await this.recognize(buffer);
        textArray = textArray.concat(text);
      }

      return textArray.join(os.EOL);
    } catch (error) {
      throw error;
    }
  }

}

function isNumber(n) {
  return typeof n === 'number' && !isNaN(n);
}

module.exports = ATT;
