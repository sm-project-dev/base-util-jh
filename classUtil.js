'use strict';
const _ = require('lodash');

/**
 * 데이터의 평균 값을 산출해주는 클래스
 */
class AverageStorage {
  /**
   * @param {{maxStorageNumber: number, keyList: string[]}} averConfig
   */
  constructor(averConfig) {
    this.keyList = averConfig.keyList;
    this.maxStorageNumber = averConfig.maxStorageNumber;
    this.dataStorage = {};

    this.init();
  }

  /**
   * dataStroage 를 설정
   */
  init() {
    this.keyList.forEach(averageKey => {
      this.dataStorage[averageKey] = [];
    });
  }

  /**
   * @param {string} key
   * @return {Array} key
   */
  findDataStorage(key) {
    return _.get(this.dataStorage, key, undefined);
  }

  /**
   * Object Key가 추적 대상인지 체크
   * @param {string} key
   */
  hasTarget(key) {
    return this.dataStorage.hasOwnProperty(key);
  }

  /**
   * 저장소에 관리 중인 Key에 data를 추가
   * @param {string} key Object Key
   * @param {number} data 실제 데이터
   * data가 undefined, null, '' 일 경우 추가하지 않음
   * data의 길이가 평균 값 분포군 최대길이에 도달하면 가장 먼저 들어온 리스트 1개 제거
   */
  addData(key, data) {
    if (data === undefined || data === null || data === '') {
      // this.findDataStorage(key).shift();
      return this;
    } else {
      let numData = _.toNumber(data);
      this.dataStorage[key].push(numData);
      this.dataStorage[key].length > this.maxStorageNumber &&
        this.findDataStorage(key).shift();
      return this;
    }
  }

  /**
   * dataStroage에서 관리 중인 Object의 평균 값을 산출
   * @param {string} key
   * @param {number=} 소수 점 이하 자리 수, default: 1
   */
  getAverage(key, positionNum) {
    let dataStorage = this.findDataStorage(key);

    positionNum = _.isNumber(positionNum) ? positionNum : 1;
    let aver = _.round(_.meanBy(dataStorage), positionNum);
    // let sum = this.dataStorage[key].reduce((prev, next) => Number(prev) + Number(next));
    return isNaN(aver) ? null : aver;
  }

  getStorage(key) {
    return this.hasTarget(key) ? this.findDataStorage(key) : undefined;
  }

  /**
   * Object 형태로 데이터를 한꺼번에 처리하고자 할 경우. 이 경우 기존 데이터를 덮어씀.
   * @param {Object} dataObj
   */
  onData(dataObj) {
    for (const key in dataObj) {
      if (dataObj.hasOwnProperty(key) && this.hasTarget(key)) {
        dataObj[key] = this.addData(key, dataObj[key]).getAverage(key);
      }
    }
    return dataObj;
  }

  /**
   * 저장소에 저장된 데이터의 평균 값을 도출하여 반환
   */
  getAverageStorage() {
    const returnValue = {};
    _.forEach(this.dataStorage, (data, key) => {
      returnValue[key] = this.getAverage(key);
    });
    return _.clone(returnValue);
  }

  /**
   * 데이터에 에러가 발생하여 평균값의 배열 최후의 데이터 1개 삭제
   * @param {Object=} dataObj 해당 값이 있을 경우 해당값의 키가 추적 대상 키인지 판별하고 맞다면 해당 평균 값 그룹에서 1개 제거
   * {a: [1,2,3], b: [3,4,5]} --> {a: [2,3], b: [4,5]}
   */
  shiftDataStorage(dataObj) {
    if (_.isEmpty(dataObj)) {
      _.forEach(this.dataStorage, dataList => {
        dataList.shift();
      });
      return this.getAverageStorage();
    } else {
      for (const key in dataObj) {
        if (dataObj.hasOwnProperty(key) && this.hasTarget(key)) {
          let dataStorage = this.findDataStorage(key);
          dataStorage !== undefined && dataStorage.shift();
        }
      }
      return this.getAverageStorage();
    }
  }
}
exports.AverageStorage = AverageStorage;

/**
 * @class
 * @classdesc setTimeout을 사용하는 형식과 비슷하나, 요청 callback 수행까지의 남은 시간 반환, 일시 정지, 동작 상태 지원
 */
function Timer(callback, delay) {
  var id,
    started,
    remaining = delay,
    running;

  /** setTimeout 재개 (setTimeout 처리함)*/
  this.start = () => {
    if (running !== true) {
      started = new Date();
      running = true;
      if (remaining > 0) {
        id = setTimeout(() => {
          callback();
        }, remaining);
      } else {
        id = clearTimeout(id);
      }
    }
  };

  /** setTimeout 정지 (clearTimeout 처리함) */
  this.pause = () => {
    if (running) {
      running = false;
      clearTimeout(id);
      remaining -= new Date() - started;
    }
  };

  /**
   * 요청 명령 실행까지의 남은 시간 반환
   * @return {number} Remained Millisecond
   */
  this.getTimeLeft = () => {
    if (running) {
      this.pause();
      this.start();
    }
    return remaining;
  };

  /**
   * Timer의 동작 유무 확인
   * @return {boolean} true: Running, false: Pause
   */
  this.getStateRunning = () => {
    return running;
  };

  this.start();
}
exports.Timer = Timer;
