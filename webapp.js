const qs = require('querystring');

const accumulate = (o, kv) => {
  let parts = kv.split('=');
  o[parts[0].trim()] = parts[1].trim();
  return o;
};

let redirect = function (path) {
  console.log(`redirecting to ${path}`);
  this.statusCode = 302;
  this.setHeader('location', path);
  this.end();
};

const parseCookies = text => {
  try {
    return text && text.split(';').reduce(accumulate, {}) || {};
  } catch (e) {
    return {};
  }
}
let invoke = function (req, res) {
  let handler = this._handlers[req.method][req.url];
  if (handler)
    handler(req, res);
}
const initialize = function () {
  this._handlers = { GET: {}, POST: {} };
  this._preprocess = [];
  this._postprocess = [];
};
const get = function (url, handler) {
  this._handlers.GET[url] = handler;
}
const post = function (url, handler) {
  this._handlers.POST[url] = handler;
};
const use = function (handler) {
  this._preprocess.push(handler);
};
const postProcess = function (handler) {
  this._postprocess.push(handler);
};
let urlIsOneOf = function (urls) {
  return urls.includes(this.url);
}
const main = function (req, res) {
  res.redirect = redirect.bind(res);
  req.urlIsOneOf = urlIsOneOf.bind(req);
  req.cookies = parseCookies(req.headers.cookie || '');
  let content = "";
  req.on('data', data => content += data.toString())
  req.on('end', () => {
    req.body = qs.parse(content);
    runMiddleWares(this._preprocess, req, res);
    if (res.finished) return;
    invoke.call(this, req, res);
    if (res.finished) return;
    runMiddleWares(this._postprocess, req, res);
    if (!res.finished) {
      resourceNotFound(req, res);
    };
  });
};

const resourceNotFound = function (req, res) {
  res.statusCode = 404;
  res.write('File not found!');
  res.end();
  return;
}

const runMiddleWares = function (middlewares, req, res) {
  middlewares.forEach(middleware => {
    if (!res.finished)
      middleware(req, res);
  });
}

let create = () => {
  let rh = (req, res) => {
    main.call(rh, req, res)
  };
  initialize.call(rh);
  rh.get = get;
  rh.post = post;
  rh.use = use;
  rh.postProcess = postProcess;
  return rh;
}
module.exports = create;
