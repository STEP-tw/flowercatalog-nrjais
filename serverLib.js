const fs = require('fs');

let commentForm = fs.readFileSync('templates/commentForm.html', 'utf8');
let loginButton = fs.readFileSync('templates/loginButton.html', 'utf8');

let users = [{ user: 'nrjais', name: "Neeraj Jaiswal" }];

let comments = fs.readFileSync('./data/data.json', 'utf8');
comments = JSON.parse(comments);

const saveComment = function (req, res) {
  let data = req.body;
  if (!data.comment) {
    res.redirect('/guestbook.html');
    return;
  }
  data.name = req.user.name;
  data.time = new Date().toLocaleString();
  comments.unshift(data);
  saveCommentsData();
  res.redirect('guestbook.html');
};

const saveCommentsData = function () {
  let dataToSave = JSON.stringify(comments, ['name', 'comment', 'time'], 2);
  fs.writeFile('data/data.json', dataToSave, (e) => e && console.log());
};

const sendCommentData = function (req, res) {
  res.setHeader('content-type', 'application/json');
  let commentsData = JSON.stringify(comments);
  res.write(commentsData);
  res.end();
}

const loadSession = function (req, res) {
  let sessionId = req.cookies.sessionId;
  if (sessionId) {
    req.user = users.find((user) => user.sessionId == sessionId);
  }
}

const getUser = function (userName) {
  return users.find(user => user.user == userName);
}

const loginUser = function (req, res) {
  let sessionId = new Date().getTime();
  let userName = req.body.username;
  let user = getUser(userName);
  if (user) {
    user.sessionId = sessionId;
    res.setHeader('Set-Cookie', `sessionId=${sessionId}`);
    res.redirect('/guestbook.html');
    return;
  }
  res.redirect('/login.html');
}

const logoutUser = function (req, res) {
  delete req.user.sessionId;
  res.setHeader('Set-Cookie', `sessionId=0; Expires=${new Date(1).toUTCString()}`);
  res.redirect('/index.html');
}

const serveGuestbook = function (req, res) {
  let page = fs.readFileSync('templates/guestbook.html', 'utf8')
  if (req.user) {
    let userName = req.user.name;
    commentFormUser = commentForm.replace('NAME_USER', userName);
    page = page.replace('COMMENTFORM', commentFormUser);
  } else {
    page = page.replace('COMMENTFORM', loginButton);
  }
  res.setHeader('content-type', 'text/html');
  res.write(page);
  res.end();
}

const redirectIfNotLoggedIn = function (req, res) {
  let urls = ['/addcomment', '/logout'];
  if (!req.user && req.urlIsOneOf(urls))
    res.redirect('/login')
}

module.exports = {
  saveComment,
  serveGuestbook,
  loginUser,
  logoutUser,
  loadSession,
  sendCommentData,
  redirectIfNotLoggedIn
}