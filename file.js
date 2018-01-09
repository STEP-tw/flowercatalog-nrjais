const fs = require('fs');

const serveStaticFile = function (req, res) {
  let fileName = 'public' + req.url;
  if (req.method == 'GET' && isFile(fileName)) {
    setHeader(res, fileName);
    let content = fs.readFileSync(fileName);
    res.write(content);
    res.end();
  }
};

const getHeader = function (fileName) {
  let extension = fileName.slice(fileName.lastIndexOf('.'));
  let headers = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
  }
  return headers[extension];
};

const isFile = function (fileName) {
  try {
    let stats = fs.statSync(fileName);
    return stats.isFile();
  } catch (error) {
    return false;
  }
};

const setHeader = function (res, fileName) {
  let header = getHeader(fileName);
  if (header)
    res.setHeader('Content-Type', header);
};

exports.serveStaticFile = serveStaticFile;