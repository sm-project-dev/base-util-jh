'use strict';
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
   */
  addData(key, data) {
    if(data == null || data === ''){
      return this;
    } else {
      this.dataStorage[key].push(data);
      this.dataStorage[key].length > this.maxStorageNumber && this.dataStorage[key].shift();
      return this;
    }
  }

  /**
   * dataStroage에서 관리 중인 Object의 평균 값을 산출
   * @param {string} key 
   */
  getAverage(key) {
    let sum = this.dataStorage[key].reduce((prev, next) => Number(prev) + Number(next));
    return isNaN(sum) ? '' : sum / this.dataStorage[key].length;
  }

  getStorage(key){
    return this.hasTarget(key) ? this.dataStorage[key] : undefined;
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

}
exports.AverageStorage = AverageStorage;




/**
 * @class
 * @classdesc setTimeout을 사용하는 형식과 비슷하나, 요청 callback 수행까지의 남은 시간 반환, 일시 정지, 동작 상태 지원
 */
function Timer(callback, delay) {
  var id, started, remaining = delay, running;

  /** setTimeout 재개 (setTimeout 처리함)*/
  this.start = () => {
    if(running !== true){
      started = new Date();
      running = true;
      if(remaining > 0){
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
    if(running){
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
