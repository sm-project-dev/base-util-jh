const _ = require('underscore');

/**
 * 단일 값 Sacle 적용. 소수점 절삭
 * @param {Number} value Scale을 적용할 Value
 * @param {Number} scale 배율. 계산한 후 소수점 절삭 1자리
 */
function multiplyScale2Value(value, scale, toFixed) {
  return typeof value === 'number' ? Number((parseFloat(value) * scale).toFixed(typeof toFixed === 'number' ? toFixed : 1)) : value;
}
exports.multiplyScale2Value = multiplyScale2Value;

/**
 * Object에 Sacle 적용. 소수점 절삭
 * @param {Object} obj Scale을 적용할 Object Data
 * @param {Number} scale 배율. 계산한 후 소수점 절삭
 */
function multiplyScale2Obj(obj, scale, toFixed) {
  let returnValue = {};
  _.each(obj, (value, key) => {
    let addObj = {
      [key]: typeof value === 'number' ? Number((parseFloat(value) * scale).toFixed(typeof toFixed === 'number' ? toFixed : 1)) : value
    };
    returnValue = Object.assign(returnValue, addObj)
  });
  return returnValue;
}

exports.multiplyScale2Obj = multiplyScale2Obj;


function toFixedAll(obj, toFixed) {
  let returnValue = {};
  _.each(obj, (value, key) => {
    let addObj = {
      [key]: typeof value === 'number' ? Number(value.toFixed(toFixed)) : value
    };
    returnValue = Object.assign(returnValue, addObj)
  });
  return returnValue;
}
exports.toFixedAll = toFixedAll;


function concatArrayBuffer() {
  let arr = [];
  console.log(arguments)
  // for (let count = 0; count < arguments.length; count += 1) {
  //   let element = arguments[count];
  //   if (typeof element === 'number') {
  //     arr.push(Buffer.from(element, 'number') );
  //   } else {
  //     element.forEach(buf => {
  //       console.log(buf)
  //       arr.push(Buffer.from(buf, 'number'));
  //     })
  //   }
  // }
  // console.log(arr)
  // return Buffer.concat(arr);
}
exports.concatArrayBuffer = concatArrayBuffer;


function mochaAsync(fn) {
  return async(done) => {
    try {
      await fn();
      done();
    } catch (err) {
      done(err);
    }
  };
}
exports.mochaAsync = mochaAsync;