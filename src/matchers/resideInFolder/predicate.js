const { readdirSync } = require('fs');

module.exports = (folderPath) => {
  readdirSync(folderPath).forEach(file => {
    console.log(file);
  });
  // const filesInPath = readdir(folderPath, function (err, files) {
  //   if (err) {
  //     return console.log('Unable to scan directory: ' + err);
  //   }
  //
  //   files.forEach(function (file) {
  //     // Do whatever you want to do with the file
  //     console.log(file);
  //   });
  // });

}
