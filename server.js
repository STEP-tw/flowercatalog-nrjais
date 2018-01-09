const http = require('http');
const fs = require('fs');
const serveStaticFile = require('./file.js').serveStaticFile;

const webapp = require('./webapp');

let users = [{ user: 'nrjais' }, {user: 'arvind'}, {user : 'debuc'}, {user : 'ravinder'}];
let PORT = 9999;

let comments = fs.readFileSync('./data/data.json', 'utf8');
comments = JSON.parse(comments);

let app = webapp();

const saveComment = function (req, res) {
  if(isNotValidUser(req)){
    res.redirect('/login.html');
    return;
  }
  let data = req.body;
  if (!data.name || !data.comment){
    res.redirect('/guestbook.html');
    return;
  }
  data.time = new Date().toLocaleString();
  comments.unshift(data);
  saveCommentsData();
  res.redirect('guestbook.html');
};

const isNotValidUser = function(req){
  return  !(req.user && req.cookies.sessionId == req.user.sessionId);
}

const saveCommentsData = function () {
  let dataToSave = JSON.stringify(comments, ['name', 'comment', 'time'], 2);
  fs.writeFile('data/data.json', dataToSave, logError);
};

const logError = function (err) {
  if (err)
    console.log(err);
};

const logRequest = function (req, res) {
  const time = new Date().toLocaleString();
  console.log(`${time} ${req.method} ${req.url}`);
};

const sendCommentData = function (req, res) {
  res.setHeader('content-type', 'text/javascript');
  let commentsData = JSON.stringify(comments);
  res.write(commentsData);
  res.end();
}

const loadSession = function (req, res) {
  let sessionId = req.cookies.sessionId;
  if(sessionId){
    req.user = users.find((user)=>user.sessionId==sessionId);
  }
}

const getUser = function(userName){
  return users.find(user => user.user == userName);
}

const loginUser = function(req, res){
  let sessionId = new Date().getTime();
  let userName = req.body.username;
  let user = getUser(userName);
  if(user){
    user.sessionId = sessionId;
    res.setHeader('Set-Cookie', `sessionId=${sessionId}`);
    res.redirect('/guestbook.html');
    return;
  }
  res.redirect('/login.html');
}

const logoutUser = function(req, res){
  if(req.user)
    delete req.user.sessionId;
  res.setHeader('Set-Cookie', `sessionId=0; Expires=${new Date(1).toUTCString()}`);
  res.redirect('/index.html');
}

app.use(logRequest);
app.use(loadSession);
app.get('/', (req, res) => res.redirect('index.html'));
app.post('/addcomment', saveComment);
app.get('/data', sendCommentData);
app.post('/login', loginUser);
app.get('/logout', logoutUser);
app.postProcess(serveStaticFile);

const server = http.createServer(app);
server.listen(PORT);
console.log('Listening on port ' + PORT);
