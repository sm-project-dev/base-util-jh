const _ = require('lodash');
const fs = require('fs');

/**
 * @param {string} dirName Folder 경로
 * @return {string[]} 폴더 이름
 */
function getDirectories(dirName){
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
    let hasExit = _.find(keyList, findObj);

    // 존재하지 않는다면
    if(_.isEmpty(hasExit)){
      keyList.push(findObj);
      returnValue.push(currentItem);
    }
  });
  return returnValue;

}
exports.unionArrayObject = unionArrayObject;


/**
 * SQL Create 코드를 Jsdoc typedef 로 자동 변환 생성
 * @param {string} path 
 */
async function schemeToJsdoc(path) {
  
  let strCreateTableCodes =  fs.readFileSync(path).toString();


  let splitStrCreateTableCodes = _.split(strCreateTableCodes, ';');

  // await setTimeout(() => {
  //   console.log('wtf');
  // }, 1000);


  const typedefList = [];


  splitStrCreateTableCodes.forEach(sqlStr => {
    let typedef = '\n/**\n';
    let splitCreateScheme = _.split(sqlStr, '\n');
    const findCommentStr = 'COMMENT';
    
    if(!sqlStr.includes('CREATE TABLE')){
      return;
    }
  
    // \n으로 Split된 array의 정보를 순회하며 typedef 개요를 설정
    _.forEach(splitCreateScheme, str  => {
      // console.log(str);
      // typedef 제목 설정
      if(str.includes('CREATE TABLE')){
        let firstIndex =  str.indexOf('`') + 1;
        let lastIndex =  str.lastIndexOf('`');
        typedef += ` * @typedef {Object} ${_.toUpper(str.slice(firstIndex, lastIndex))}`;
      }

      if(str.includes(findCommentStr) && str.indexOf(findCommentStr) === 0){
        // console.log('!!!', findCommentStr);

        let firstIndex = str.indexOf('\'');
        let comment =  str.slice(firstIndex);
        typedef += ` ${comment}`;
      }
    });
    typedef += '\n';
  
    // property를 가져오기 위하여 \t 분리 배열 생성
    splitCreateScheme = _.split(sqlStr, '\t');
    splitCreateScheme.forEach(currentItem => {
      // currentItem = _.replace(currentItem, /\s/g, ' ');

      currentItem = _.head(currentItem.split('\n')); 


      currentItem = currentItem.trim().replace(/ +/g, ' ');
      // comment를 가져옴
      const firstCommentIndexStr = 'COMMENT \'';
      let firstIndex =  currentItem.indexOf(firstCommentIndexStr);
      // console.log('??????', firstIndex);
      let lastIndex =  currentItem.lastIndexOf('\'');
      // 코멘트를 짜름
      let propertyComment = firstIndex < lastIndex ? currentItem.slice(firstIndex + firstCommentIndexStr.length, lastIndex) : '';
      
      // 스페이스로 배열화
      let splitList = _.split(currentItem, ' ');
      // 첫번째 배열은 컬럼 명
      let columnName = _.head(splitList);
      // 맞는지 확인
      if(_.startsWith(columnName, '`') && _.endsWith(columnName, '`')){
        let propertyType = convertSqlTypeToJavascriptType(_.nth(splitList, 1)); 
        // 백탭 삭제
        const propertyName = _.trim(columnName, '`');
        propertyComment = propertyComment === null ? '' : _.trim(propertyComment, '\'');
  
        typedef += ` * @property {${propertyType}} ${propertyName} ${propertyComment} \n`;
      }
    });
  
    typedef += ' */\n';

    typedefList.push(typedef);
  });
  // console.log(typedefList.length);
  typedefList.forEach(currentItem => {
    console.log(currentItem);
  });
  
  
  return typedefList;
}
exports.schemeToJsdoc = schemeToJsdoc;

/**
 * 
 * @param {string} sqlType 
 */
function convertSqlTypeToJavascriptType(sqlType) {
  // console.log('sqlType', sqlType);
  let returnValue = '';
  const stringList = ['CHAR', 'VARCHAR', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT', 'JSON', 'ENUM'];
  const numberList = ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'BIT', 'FLOAT', 'DOUBLE', 'DECIMAL'];
  const DateList = ['DATE', 'TIME', 'YEAR', 'DATETIME', 'TIMESTAMP'];
  const BufferList = ['BINARY', 'VARBINARY', 'TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB'];

  const caseList = {
    string: stringList,
    number: numberList,
    Date: DateList,
    Buffer: BufferList
  };

  _.find(caseList, (arr, key) => {
    let fountIt =  _.find(arr, ele => {
      return sqlType.includes(ele);
    });

    if(!_.isEmpty(fountIt)){
      returnValue = key;
      return true;
    }
  });
  return returnValue;
}



// if __main process
if (require !== undefined && require.main === module) {
  // let dic = getDirectories(__dirname);
  // console.log(dic);
  
  // let auto = requireAuto(__dirname);
  // console.log(auto);

  schemeToJsdoc('./temp.txt');

}
