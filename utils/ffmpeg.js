const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class Ff {
  constructor(file = '') {
    this.file = file;
  }

  /**
   * ffmpeg输入文件
   * @param {String|ReadableStream} [file] 文件路径或文件可读流
   */
  input(file) {
    this.file = file;
    return this;
  }

  /**
   * 获取多媒体元数据
   * 
   * @param {String|ReadableStream} [file] 文件路径或文件可读流
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
   * @returns {Promise}
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
   * @returns {Promise} 执行成功 则返回 [duration] 单位：秒
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
   * @param {Number} [step] 每段时长
   * @param {String} [dest] 目标输出路径
   */
  async split(step, dest = 'output/') {
    try {
      const data = await this.metadata();
      const { duration, filename, start_time } = data.format;
      const { pre, ext } = this.getFileName(filename);
      // 文件分割份数
      const count = Math.ceil(duration / step);
      let start = start_time;
      let baseDir = dest + pre;
      await mkdirs(baseDir);

      for (let index = 0; index < count; index++) {
        let output = baseDir + '/' + pre + index + '.' + ext;
        await ffmpeg(this.file)
                .output(output)
                .seek(start)
                .duration(step)
                .run();
        start += step;
      }

      return;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取文件后缀名
   * @param {String} [path] 文件路径 
   * @returns {Object} 包含filename和ext(后缀名)
   */
  getFileName(file_path) {
    const file = path.basename(file_path).split('.');
    return {
      pre: file[0],
      ext: file[1]
    };
  }
}

module.exports = Ff;

async function mkdir(pos, dirArray){
  const len = dirArray.length;
  let currentDir = '';

  if( pos >= len || pos > 10) return;
  
  for(let i = 0; i <= pos; i++){
      if(i != 0) currentDir += '/';
      currentDir += dirArray[i];
  }

  console.log(currentDir);

  const exist = await fs.existsSync(currentDir);

  if (!exist) {
    try {
      fs.mkdir(currentDir);
    } catch (error) {
      throw error;
    }
  }

  mkdir(pos+1, dirArray);
}

//创建目录结构
async function mkdirs(dirpath) {
  var dirArray = dirpath.split('/');
  const exist = fs.existsSync(dirpath);
  try {
    !exist && await mkdir(0, dirArray);
    return;
  } catch (error) {
    throw error;
  }
}