const fs = require('fs');
const glob = require('glob');
const path = require('path');

function Fi() {
  if (!(this instanceof Fi)) {
    return new Fi();
  }
}

module.exports = Fi;

/**
 * 根据规则查询出匹配文件列表
 * @param {String} pattern 参考node-glob的匹配模式 
 * @return {Promise} 
 */
Fi.prototype.getFiles = function(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

/**
 * 递归函数：创建目录
 * @param {Number} pos 当前目录层级
 * @param {Array} dirArray 目录拆分后的数据 
 *   eg: 'a/b/c' -> ['a', 'b', 'c']
 */
Fi.prototype._mkdir = async function(pos, dirArray) {
  const len = dirArray.length;
  let currentDir = '';

  if( pos >= len || pos > 10) return;
  
  for(let i = 0; i <= pos; i++){
    if(i != 0) currentDir += path.sep;
    currentDir += dirArray[i];
  }

  const exist = await fs.existsSync(currentDir);

  if (!exist) {
    try {
      fs.mkdir(currentDir, err => { if (err) console.log(err) });
    } catch (error) {
      throw error;
    }
  }

  await this._mkdir(pos + 1, dirArray);
}

/**
 * 创建多级目录
 * @param {String} dirpath 需要创建的目录
 * @return {Promise} 
 */
Fi.prototype.mkdirs = async function(dirpath) {
  const dirArray = dirpath.split(path.sep);
  const exist = fs.existsSync(dirpath);
  try {
    !exist && await this._mkdir(0, dirArray);
    return;
  } catch (error) {
    throw error;
  }
}
