
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
    this.dataStorage[key].push(data);
    this.dataStorage[key].length > this.maxStorageNumber && this.dataStorage[key].shift();
    return this;
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