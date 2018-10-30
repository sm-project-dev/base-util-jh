const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const BU = require('./baseUtil');
const Promise = require('bluebird');

/**
 * @param {string} dirName Folder 경로
 * @return {string[]} 폴더 이름
 */
function getDirectories(dirName) {
  const path = require('path');
  return fs
    .readdirSync(dirName)
    .filter(file => fs.lstatSync(path.join(dirName, file)).isDirectory());
}
exports.getDirectories = getDirectories;

/**
 * 하부 폴더 전부 require 후 객체에 담아 던져줌
 * @param {string} path dirName
 * @return {Object} {key: requireObj}
 */
function requireAuto(path) {
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
    if (_.isArray(unionKeyList)) {
      unionKeyList.forEach(unionKey => {
        findObj[unionKey] = currentItem[unionKey];
      });
    } else if (_.isString(unionKeyList)) {
      findObj[unionKeyList] = currentItem[unionKeyList];
    } else {
      throw new Error('unionKeyList 타입을 명확히 하십시오.');
    }
    let hasExit = _.find(keyList, findObj);

    // 존재하지 않는다면
    if (_.isEmpty(hasExit)) {
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
  let strCreateTableCodes = fs.readFileSync(path).toString();

  let splitStrCreateTableCodes = _.split(strCreateTableCodes, ';');

  // await setTimeout(() => {
  //   console.log('wtf');
  // }, 1000);

  const typedefList = [];

  splitStrCreateTableCodes.forEach(sqlStr => {
    let typedef = '\n/**\n';
    let splitCreateScheme = _.split(sqlStr, '\n');
    const findCommentStr = 'COMMENT';

    if (!sqlStr.includes('CREATE TABLE')) {
      return;
    }

    let header = '';
    // \n으로 Split된 array의 정보를 순회하며 typedef 개요를 설정
    _.forEach(splitCreateScheme, str => {
      // typedef 제목 설정
      if (str.includes('CREATE TABLE')) {
        let firstIndex = str.indexOf('`') + 1;
        let lastIndex = str.lastIndexOf('`');

        let trimHeader = _.trimStart(header, '--');
        if (trimHeader.includes('VIEW')) {
          trimHeader = trimHeader.slice(6);
          typedef += ` * @desc VIEW TABLE\n`;
        }

        typedef += ` * @typedef {Object} ${_.toUpper(
          str.slice(firstIndex, lastIndex),
        )} ${trimHeader}\n`;
      } else {
        header = str;
      }
    });

    // property를 가져오기 위하여 \t 분리 배열 생성
    splitCreateScheme = _.split(sqlStr, '\t');
    splitCreateScheme.forEach(currentItem => {
      const splitMsg = currentItem.split("'");
      const headerMsg = _.head(splitMsg)
        .trim()
        .replace(/ +/g, ' ');
      // 스페이스로 배열화
      let splitList = _.split(headerMsg, ' ');
      // 첫번째 배열은 컬럼 명
      let columnName = _.head(splitList);
      let dataType = _.nth(splitList, 1);
      // 맞는지 확인
      if (_.startsWith(columnName, '`') && _.endsWith(columnName, '`')) {
        let propertyType = convertSqlTypeToJavascriptType(dataType);
        // 백탭 삭제
        const propertyName = _.trim(columnName, '`');
        const foundIndex = _.findIndex(splitMsg, msg => _.includes(msg, 'COMMENT'));
        let commentMsg = foundIndex >= 0 ? _.nth(splitMsg, foundIndex + 1) : '';
        if (commentMsg.length) {
          commentMsg = _.trim(commentMsg, "'");
        }
        typedef += ` * @property {${propertyType}} ${propertyName} ${commentMsg} \n`;
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
  const stringList = [
    'CHAR',
    'VARCHAR',
    'TINYTEXT',
    'TEXT',
    'MEDIUMTEXT',
    'LONGTEXT',
    'JSON',
    'ENUM',
  ];
  const numberList = [
    'TINYINT',
    'SMALLINT',
    'MEDIUMINT',
    'INT',
    'BIGINT',
    'BIT',
    'FLOAT',
    'DOUBLE',
    'DECIMAL',
  ];
  const DateList = ['DATE', 'TIME', 'YEAR', 'DATETIME', 'TIMESTAMP'];
  const BufferList = ['BINARY', 'VARBINARY', 'TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB'];

  const caseList = {
    string: stringList,
    number: numberList,
    Date: DateList,
    Buffer: BufferList,
  };

  _.find(caseList, (arr, key) => {
    let fountIt = _.find(arr, ele => {
      return sqlType.includes(ele);
    });

    if (!_.isEmpty(fountIt)) {
      returnValue = key;
      return true;
    }
  });
  return returnValue;
}

/*****************************************************************************************************************/
//*************                                     File 관련                                        *************
/*****************************************************************************************************************/

/**
 * @param {string} path
 * @param {string} encoding
 */
async function readFile(path, encoding) {
  encoding = encoding == null || encoding === '' ? 'utf8' : encoding;

  const readFile = Promise.promisify(fs.readFile);

  return await readFile(path, encoding);
}
exports.readFile = readFile;

/**
 * 파일 쓰기. 경로에 폴더가 없다면 생성
 * @param {string} path
 * @param {*} message
 * @param {string=} option default: 'a'
 * @example
 * 'r' - 읽기로 열기. 파일이 존재하지 않으면 에러발생.
 * 'r+' - 읽기/쓰기로 열기. 파일이 존재하지 않으면 에러발생.
 * 'w' - 쓰기로 열기. 파일이 존재하지 않으면 만들어지고, 파일이 존재하면 지우고 처음부터 씀.
 * 'w+' - 읽기/쓰기로 열기. 파일이 존재하지 않으면 만들어지고, 파일이 존재하면 처음부터 씀.
 * 'a' - 추가 쓰기로 열기. 파일이 존재하지 않으면 만들어짐.
 * 'a+' - 파일을 읽고/추가쓰기모드로 열기. 파일이 존재하지 않으면 만들어짐.
 */
async function writeFile(path, message, option) {
  try {
    option = option === '' || option == null ? 'a' : option; // 기본 옵션 '이어 쓰기'
    message = typeof message === 'object' ? JSON.stringify(message) : message;
    const writeFile = Promise.promisify(fs.writeFile);

    return await writeFile(path, message, {
      flag: option,
    });
  } catch (err) {
    if (err.errno === -4058) {
      const targetDir = err.path.substr(0, err.path.lastIndexOf('\\'));
      await makeDirectory(targetDir);
      return writeFile(arguments);
    }
    throw err;
  }
}
exports.writeFile = writeFile;

// 디렉토리 읽기
async function searchDirectory(path) {
  var returnvalue = [];

  const readdir = Promise.promisify(fs.readdir);

  const files = await readdir(path);
  files.forEach(function(file) {
    returnvalue.push(file);
    // console.log(path + file);
    fs.stat(path + file, function(err, stats) {
      console.log(stats);
    });
  });

  return returnvalue;
}
exports.searchDirectory = searchDirectory;

// 디렉토리 생성
async function makeDirectory(path) {
  const mkdirp = Promise.promisify(fs.mkdirp);

  return await mkdirp(path);
}
exports.makeDirectory = makeDirectory;

// 디렉토리 삭제
async function deleteDirectory(path) {
  const rmdir = Promise.promisify(fs.rmdir);
  return await rmdir(path);
}
exports.deleteDirectory = deleteDirectory;

/*****************************************************************************************************************/
//*************                                  Security 관련                                       *************
/*****************************************************************************************************************/
// Make Globally Unique Identifier  /// <returns type="String" />

/**
 * @description password를 암호화하여 반환. pbkdf2 알고리즘에 의하여 Sha512 알고리즘 사용한 3단계 암호화 기본.
 * @param {String} password
 * @param {String} salt
 * @param {function(String)} cb 완성된 암호화 해시 Password를 callback을 통해 반환
 */
async function encryptPbkdf2(password, salt) {
  // BU.CLIS(password, salt);

  password = password == null ? '' : password;

  const pbkdf2 = Promise.promisify(crypto.pbkdf2);

  // password, salt, iterations, keylen, digest, callback)
  const hashPw = await pbkdf2(password, salt, 3, 64, 'sha512');

  return hashPw.toString('hex');
}
exports.encryptPbkdf2 = encryptPbkdf2;

// if __main process
if (require !== undefined && require.main === module) {
  // let dic = getDirectories(__dirname);
  // console.log(dic);

  // let auto = requireAuto(__dirname);
  // console.log(auto);

  schemeToJsdoc('./temp.txt');
}
