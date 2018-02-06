/**
 * @param {string} dirName Folder 경로
 * @return {string[]} 폴더 이름
 */
function getDirectories(dirName){
  const fs = require('fs');
  const path = require('path');
  return fs.readdirSync(dirName).filter(file => fs.lstatSync(path.join(dirName, file)).isDirectory());
}
exports.getDirectories = getDirectories;

/**
 * 하부 폴더 전부 require 후 객체에 담아 던져줌
 * @param {string} path dirName
 * @return {Object} {key: requireObj} 
 */
function requireAuto(path){
  try {
    const requireObj = {};
    const reg = /^[^.]/;
    const directoryList = getDirectories(path);
    const filteringList = directoryList.filter(ele => {
      return reg.test(ele);
    });
  
    filteringList.forEach(ele => {
      requireObj[ele] = require(ele);
    });
    return requireObj;
  } catch (error) {
    throw error;
  }
}
exports.requireAuto = requireAuto;


let dic = getDirectories(__dirname);
console.log(dic);

let auto = requireAuto(__dirname);
console.log(auto);