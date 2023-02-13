const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'main/domains');

const { optout } = require("./optout");

let combinedArray = [];

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  files.forEach(function (file) {
    const filePath = path.join(directoryPath, file);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;

      const dataArray = [JSON.parse(data)];

      for (const item of dataArray) {
        if (!item.hasOwnProperty('owner') || !item.owner.hasOwnProperty('email')) {
          console.error(`Error: ${file} does not contain an email field`);
        } else {
          delete item.owner.email;
        }
        item.domain = path.parse(file).name + '.is-a.dev';
      }

      combinedArray = combinedArray.concat(dataArray);

      if (combinedArray.length === files.length) {
        const filteredData = combinedArray.filter(entry => !optout.includes(entry.owner.username.toLowerCase()));

        fs.writeFile('index.json', JSON.stringify(filteredData), (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
      }
    });
  });
});
