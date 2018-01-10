const timeStamp = require('./time.js').timeStamp;
const fs = require('fs');

exports.logRequest = (req, res) => {
  let text = ['--------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${JSON.stringify(req.headers, null, 2)}`,
    `COOKIES=> ${JSON.stringify(req.cookies, null, 2)}`,
    `BODY=> ${JSON.stringify(req.body, null, 2)}`, ''].join('\n');
  fs.appendFile('request.log', text, () => { });
  console.log(`${req.method} ${req.url}`);
}
