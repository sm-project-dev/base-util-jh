const BU = require('./baseUtil');



function ChainingControllers(dirName, app) {
  BU.searchDirectory(dirName, (err, resSearchDirectory) => {
    try {
      let directoryList = BU.getDirectories(dirName);
      resSearchDirectory.forEach((element) => {
        if (directoryList.includes(element)) {
          // BU.CLI('성공', `${dirName}\\${element}`)
          require(`${dirName}\\${element}`)(app)
        } else {
          // BU.CLI('실패', element)
          if (element === 'index.js') {
            return false;
          } else {
            // BU.CLI(`${dirName}\\${element}`)
            let eleObj = require(`${dirName}\\${element}`)(app);

            let routerHeaderUrl = getControllerPath(`${dirName}\\${element}`);
          //  BU.CLI(routerHeaderUrl) 
            app.use(routerHeaderUrl, eleObj);
          }

        }
      });
    } catch (error) {
      BU.CLI(error)
    }

  })
}
exports.ChainingControllers = ChainingControllers;


function getControllerPath(fullPath) {
  let mainPath = CONTROLLERS_PATH;

  let slicePath = fullPath.substr(CONTROLLERS_PATH.length);
  let routerName = slicePath.substr(0, slicePath.lastIndexOf('.js'));
  return routerName.replaceAll('\\', '/');
  // BU.CLIS(fullPath, CONTROLLERS_PATH, slicePath, routerName)
}