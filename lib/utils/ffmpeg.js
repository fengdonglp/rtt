const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fi = require('./file')();

class Ff {
  constructor(file = '') {
    this.file = file;
  }

  /**
   * ffmpeg输入文件
   * @param {String|ReadableStream} file 文件路径或文件可读流
   */
  input(file) {
    this.file = file;
    return this;
  }

  /**
   * 获取多媒体元数据
   * 对应ffmepg命令：ffprobe -v quiet -print_format json -show_format -show_streams #{source}
   * metadata eg:
   *  { 
   *    streams: [{ 
   *      index: 0,
   *      codec_name: 'aac',
   *      codec_long_name: 'AAC (Advanced Audio Coding)',
   *      ...
   *    }],
   *    format: { 
   *      filename: './assets/record.m4a',
   *      nb_streams: 1,
   *      nb_programs: 0,
   *      format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
   *      format_long_name: 'QuickTime / MOV',
   *      start_time: 0.044,
   *      duration: 391.891667, // 单位：秒
   *      size: 3268401,
   *      bit_rate: 66720,
   *      probe_score: 100,
   *      tags: { 
   *        major_brand: 'M4A ',
   *        ...
   *      } 
   *    },
   *    chapters: []
   *  }
   * @return {Promise}
   */
  metadata() {
    return new Promise((resolve, reject) => {
      if (!this.file) {
        throw new Error('Parameter file is required');
      }
      ffmpeg(this.file).ffprobe((err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    })
  }

  /**
   * 获取多媒体时长
   * 
   * @return {Promise} 执行成功 则返回 duration 单位：秒
   */
  async getDuration() {
    try {
      const metadata = await this.metadata(this.file);
      return metadata.format.duration;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 将音频按照step值切分成若干个音频文件
   * @param {Number} step 每段时长
   * @param {String} dest 目标输出路径
   */
  async split(step, dest = 'output/') {
    try {
      const data = await this.metadata();
      const { duration, filename } = data.format;
      const { pre, ext } = this.getFileName(filename);
      const baseDir = path.join(dest, pre);
      // 文件分割份数
      const count = Math.ceil(duration / step);
      let start = 0; // 分割文件开始时间
      await fi.mkdirs(baseDir);

      for (let index = 0; index < count; index++) {
        let outputPath = path.join(baseDir, index + '.' + ext);
        await this.ffmpegSplit(start, step, outputPath);
        start += step;
      }

      return baseDir;
    } catch (error) {
      throw error;
    }
  }

  ffmpegSplit(start, step, output) {
    return new Promise((resolve, reject) => {
      ffmpeg(this.file)
        .output(output)
        .seek(start)     // 对应ffmepg的 -ss
        .duration(step) // 对应ffmepg的  -t
        .on('end', () => {
          resolve();
        })
        .on('error', err => {
          reject(err);
        })
        .run();
      return;
    })
  }

  /**
   * 获取文件后缀名
   * @param {String} path 文件路径 
   * @return {Object} 包含filename和ext(后缀名)
   */
  getFileName(file_path) {
    const file = path.basename(file_path).split('.');
    return {
      pre: file[0],
      ext: file[1]
    };
  }

  /**
   * 将单个音频文件转码为百度语音支持的pcm格式
   * @param {String} dest 转码后的存放目录 
   * @return {Promise}
   */
  async transcode2Pcm(dest) {
    const { pre } = this.getFileName(this.file);
    dest = path.join(dest || path.dirname(this.file), 'pcm');
    await fi.mkdirs(dest);

    await transform.call(this);
    return dest;

    function transform() {
      return new Promise((resolve, reject) => {
        ffmpeg().input(this.file)
          .inputOptions([
            '-y'
          ])
          .output(path.join(dest, `${pre}.pcm`))
          .audioCodec('pcm_s16le') // 指定pcm 16bits编码器
          .audioChannels(1) // 单声道
          .audioFrequency(16000) // 16000采样率
          .format('s16le') // 保存为16bits pcm格式
          .on('end', () => {
            resolve(dest);
          })
          .on('error', err => {
            reject(err);
          })
          .run();
      });
    }
  }

  /**
   * 将单个音频文件转码为百度语音支持的pcm格式，可批量转码
   * @param {String|Array} files 
   */
  async transcode(files) {
    let pcm_path = '';
    try {
      if (Array.isArray(files)) {
        for (let index = 0; index < files.length; index++) {
          let file = files[index];
          pcm_path = await this.input(file).transcode2Pcm();
        }
      } else {
        pcm_path = await this.input(files).transcode2Pcm();
      }

      return path.resolve(process.cwd(), pcm_path);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Ff;