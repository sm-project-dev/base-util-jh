const _ = require('underscore');
const BU = require('./baseUtil');

function locationAlertBack(message) {
  message = global.fixmeConfig.isTest ? BU.MRF(message) : '알 수 없는 오류가 발생하였습니다.';
  return '<script>alert("' + message + '");history.back(-1);</script>';
}
exports.locationAlertBack = locationAlertBack;

function locationAlertGo(message, page) {
  message = global.fixmeConfig.isTest ? BU.MRF(message) : '알 수 없는 오류가 발생하였습니다.';
  return '<script>alert("' + message + '");location.href ="' + page + '";</script>';
}
exports.locationAlertGo = locationAlertGo;

function locationJustGo(page) {
  return '<script>location.href ="' + page + '";</script>';
}
exports.locationJustGo = locationJustGo;

/**
 * d
 * @param {String} req 레퍼런스
 * @param {*} menuNum 
 */
function makeBaseHtml(req, menuNum) {
  return {
    menuNum
  };
}
exports.makeBaseHtml = makeBaseHtml;


function makeResObj(req, sidebarNum, pageCount) {
  var page = BU.checkIntStr(req.query.page) ? req.query.page : 1;
  var search = req.query.search || '';
  var querystring = 'search=' + encodeURIComponent(search) + '';
  // BU.CLI(req._parsedOriginalUrl);
  makeBaseHtml();
  return {
    page: page,
    search: search,
    pageCount: pageCount || 10,
    pathName: req._parsedOriginalUrl.pathname,
    querystring: querystring,
    sidebarNum: sidebarNum,
    err: null
  };
}
exports.makeResObj = makeResObj;


/**
 * BootStrap 용 Pagination Dom 생성
 * @param {Array} dataList 
 * @param {Number} page 
 * @param {Number} totalCount
 * @return {Dom}
 */
function makeBsPagination(page, totalCount, href, queryString, pageListCount){
  let paginationDom = '';
  let maxPage = 0;
  // list 총 개수
  totalCount = Number(totalCount);
  // 선택한 pagination 번호
  page = Number(page);
  // 연결 href 주소
  let _pageListCount = pageListCount ? pageListCount : 10;    // List Rows Number
  let _paginationCount = 10; // Pagination Number

  // pagination 시작 번호
  let startPage = Math.floor((page - 1) / _paginationCount) * _paginationCount + 1;
  // pagination 끝 번호
  let endPage = startPage + _paginationCount - 1;
  // pagination 최대 번호
  maxPage = Math.floor((totalCount - 1) / _pageListCount) + 1;
  endPage = endPage > maxPage ? maxPage : endPage;

  let pageHref = href + '?';
  _.each(queryString, (value, name) => {
    pageHref += `${name}=${value}&`;
  });


  let prevHref = startPage > 1 ? `href="${pageHref}page=${startPage - 1}"` : '';
  let nextHref = maxPage > endPage ? `href="${pageHref}page=${endPage + 1}"` : '';

  paginationDom += `
  <ul class="pagination">
    <li class="page-item ${startPage > 1 ? '' : 'disabled'}">
      <a class="page-link" ${prevHref} tabindex="">Previous</a>
    </li>
    `;
  for(let i = startPage; i <= endPage; i++ ){
    paginationDom += `
      <li class="page-item ${i === page ? 'active' : ''}">
      <a class="page-link" href="${pageHref}page=${i}">${i} <span class="sr-only">(current)</span></a>
    </li>`;
  }
  paginationDom += `
      <li class="page-item ${maxPage > endPage ? '' : 'disabled'}">
        <a class="page-link" ${nextHref} tabindex="}">Next</a>
      </li>
    </ul>
    `;

  return {
    page, maxPage, totalCount, href, queryString, paginationDom, pageListCount: _pageListCount
  };

}
exports.makeBsPagination = makeBsPagination;

function makePaginationHtml(resObj, queryResult) {
  resObj.list = queryResult;
  resObj.totalCount = queryResult.totalCount;
  resObj.pagination = BU.makePagination(resObj);
  return resObj;
}
exports.makePaginationHtml = makePaginationHtml;

//Test
function makeTestHtml(resObj,queryResult){
  resObj.optionList=queryResult.optionList;
  resObj.tableList=queryResult.tableList;
  resObj.chartList = JSON.stringify(queryResult.chartList);
  resObj.connector_seq = queryResult.connector_seq;
  return resObj;
}
exports.makeTestHtml=makeTestHtml;

//Test
function makeTrendHtml(resObj,queryResult){
  resObj.date = queryResult.date;
  resObj.chartList_1 = JSON.stringify(queryResult.chartList_1);
  resObj.optradio=queryResult.optradio;
  resObj.moduleChart=JSON.stringify(queryResult.moduleChart);
  return resObj;
}
exports.makeTrendHtml=makeTrendHtml;
//Test
function makeMainHtml(resObj,queryResult) {
  resObj.dailyPower=JSON.stringify(queryResult.chartList);
  resObj.moduleStatus=queryResult.moduleStatus;
  return resObj;
}
exports.makeMainHtml=makeMainHtml;

function makeInverterHtml(resObj,queryResult) {
  resObj.ivtTableList=queryResult.ivtTableList;
  resObj.chartList=JSON.stringify(queryResult.chartList);
  return resObj;
}
exports.makeInverterHtml=makeInverterHtml;

function makeMainPaging(resObj,queryResult){
  var moduleStatus='';
  for (var i = 0; i < queryResult.length; i++) {
    moduleStatus+=`<div class="col-sm-3 con_b_c" style="margin-left:18px;">
                    <ul class="con_b_d">
                      <li class="con_b_d_f">
                        <p>${queryResult[i].title}</p>
                        <img src="image/green.png" />
                        </li>
                        <li class="con_b_d_la">
                          <p>전력</p><input type="text" name="V" value="1.78" style="margin-left:40px; margin-right:12px;">
                          <p>kWh</p>
                        </li>
                        <li class="con_b_d_la">
                          <p>수위</p><input type="text" name="V" value="3" style="margin-left:40px; margin-right:12px;">
                          <p>cm</p>
                        </li>
                        <li class="con_b_d_la">
                          <p>모듈온도</p><input type="text" name="V" value="30.6" style="margin-left:10px; margin-right:10px;">
                          <p>℃</p>
                        </li>
                      </ul>
                    </div>`;
  }
  console.log(moduleStatus);
  resObj.moduleStatus=moduleStatus;
  return resObj;
}
exports.makeMainPaging=makeMainPaging;