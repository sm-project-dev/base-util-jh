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
    returnValue = Object.assign(returnValue, addObj);
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
    returnValue = Object.assign(returnValue, addObj);
  });
  return returnValue;
}
exports.toFixedAll = toFixedAll;


function concatArrayBuffer() {
  let arr = [];
  console.log(arguments);
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

class CalculateAverage {
  // 부모 객체, [{key:{averageCount, ciriticalRange}}]
  /**
   * 
   * @param {{averageCount: number, maxCycleCount: number, criticalInfo: Object }} calculateOption 
   */
  constructor(calculateOption) {
    this.averageCount = calculateOption.averageCount;
    this.maxCycleCount = calculateOption.maxCycleCount;
    this.criticalInfo = calculateOption.criticalInfo;

    this.currCycleCount = 0;


    this.averageStorage = this.init();
  }

  /**
   * @return {Object}
   */
  init() {
    let averageObj = {};
    for (let key in this.criticalInfo) {
      averageObj[key] = {
        critical: this.criticalInfo[key],
        storage: [],
        average: null
      };
    }
    return averageObj;
  }

  /**
   * 
   * @param {string} key 
   * @return {number}
   */
  getAverageData(key){
    return this.averageStorage[key].average;
  }

  // 데이터 수신 
  // {key:value}
  /**
   * 
   * @param {Object} dataObj 
   * @return {{hasOccurEvent: boolean, averageStorage: Object }}
   */
  onData(dataObj) {
    this.currCycleCount++;

    // 강제로 평균 값을 구하는 여부
    let hasManualCalculation = false;

    // 데이터 변화가 없어도 주기적으로 데이터를 전송시키는 Count가 Max에 도달 하였을 경우
    if (this.currCycleCount > this.maxCycleCount) {
      this.currCycleCount = 0;
      hasManualCalculation = true;
    }
    
    // 이벤트가 발생할 수 있는 불린
    let hasOccurEvent = false;
    // 데이터 Key 만큼 반복
    for (let key in dataObj) {
      // 수신된 데이터를 push
      let target = this.averageStorage[key];
      target.storage.push(dataObj[key]);

      // 데이터가 최소 averageCount 보다는 높아야 계산
      // console.log('@@@', target.storage.length , this.averageCount)
      if (target.storage.length >= this.averageCount) {
        // 데이터가 찼을 경우 평균 값 반환
        if (target.storage.length === this.averageCount) {
          hasOccurEvent = true;
        } else if(target.storage.length > this.maxCycleCount){  // 최대 배열에 다가가면 fifo 처리
          target.storage.shift();
        }
        
        // 현재 평균 값을 구함
        let average = this.calcAverage(target.storage);
        // 이전 평균값에서 현재 평균값을 뺌
        let critical = target.average - average;
        // 지정된 임계치 값을 계산한 임계치가 넘어섰다면 데이터 변동이 있는 것으로 판단
        if (target.critical < Math.abs(critical) || hasManualCalculation || hasOccurEvent) {
          hasOccurEvent = true;
          target.average = average;
        }
      }
    }
    return {hasOccurEvent, averageStorage: this.averageStorage};
  }

  /**
   * @return {Object}
   * @example 
   * {vol: 115.3, amp: 7.89, etc: ...}
   */
  getData() {
    let returnValue = {};
    _.each(this.averageStorage, (currItem, key) => {
      returnValue[key] = currItem.average;
    });
    return returnValue;
  }

  // FIXME: 소수 자릿 수 지정 규칙 및 예외 처리 필요
  calcAverage(array) {
    try {
      let average = array.reduce((a, b) => Number(a) + Number(b)) / array.length;
      if (this.isFloat(average)) {
        average =  Number(average.toFixed(2));
      }
      return average;
    } catch (error) {
      return 0;
    }

  }

  isFloat(n) {
    return n === +n && n !== (n | 0);
  }

  isNumeric(num, opt) {
    // 좌우 trim(공백제거)을 해준다.
    num = String(num).replace(/^\s+|\s+$/g, '');
    var regex = '';
    if (typeof opt == 'undefined' || opt == '1') {
      // 모든 10진수 (부호 선택, 자릿수구분기호 선택, 소수점 선택)
      regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    } else if (opt == '2') {
      // 부호 미사용, 자릿수구분기호 선택, 소수점 선택
      regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    } else if (opt == '3') {
      // 부호 미사용, 자릿수구분기호 미사용, 소수점 선택
      regex = /^[0-9]+(\.[0-9]+)?$/g;
    } else {
      // only 숫자만(부호 미사용, 자릿수구분기호 미사용, 소수점 미사용)
      regex = /^[0-9]$/g;
    }

    if (regex.test(num)) {
      num = num.replace(/,/g, '');
      return isNaN(num) ? false : true;
    } else {
      return false;
    }
  }
}

exports.CalculateAverage = CalculateAverage;