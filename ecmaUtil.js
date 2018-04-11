const _ = require('underscore');

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

/**
 * Object[] Argument 들을 지정된 unionKey을 기준으로 Union 처리한 후 반환
 * @param {string[]} unionKeyList 묶을 키
 * @param {Object[]} item 
 */
function unionArrayObject(unionKeyList, ...item) {
  let returnValue = [];
  // 2차원 배열을 1차원으로 
  let flatItem = _.flatten([item]);
  let keyList = [];
  flatItem.forEach(currentItem => {
    let findObj = {};
    if(_.isArray(unionKeyList)){
      unionKeyList.forEach(unionKey => {
        findObj[unionKey] = currentItem[unionKey];
      });
    } else if(_.isString(unionKeyList)){
      findObj[unionKeyList] = currentItem[unionKeyList];
    } else {
      throw new Error('unionKeyList 타입을 명확히 하십시오.');
    }
    let hasExit = _.findWhere(keyList, findObj);

    // 존재하지 않는다면
    if(_.isEmpty(hasExit)){
      keyList.push(findObj);
      returnValue.push(currentItem);
    }
  });
  return returnValue;

}
exports.unionArrayObject = unionArrayObject;

// if __main process
if (require !== undefined && require.main === module) {
  let dic = getDirectories(__dirname);
  console.log(dic);
  
  let auto = requireAuto(__dirname);
  console.log(auto);
}
