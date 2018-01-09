const http = require('http');
const fs = require('fs');
const serveStaticFile = require('./file.js').serveStaticFile;
const timeStamp = require('./time.js').timeStamp;

const webapp = require('./webapp');

let commentForm = `<a href="/logout">Logout</a>
<h2>Leave a comment</h2>
<form class="input" action = "/addcomment" method = "post" >
Name : <b>NAME_USER</b>
<br>
<br> Comment :
<textarea name="comment" rows="4" cols="40"></textarea>
<br>
<br>
<button type="submit">Submit</button>
</form>`;

let loginButton = `<h2>Login to comment</h2><a href="/login.html">Login</a>`;

let users = [{ user: 'nrjais', name:"Neeraj Jaiswal"}];
let PORT = 9999;

let comments = fs.readFileSync('./data/data.json', 'utf8');
comments = JSON.parse(comments);

let app = webapp();

const saveComment = function (req, res) {
  if (!isUserLoggedIn(req)) {
    res.redirect('/login.html');
    return;
  }
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

const isUserLoggedIn = function (req) {
  return req.user && req.cookies.sessionId == req.user.sessionId;
}

const saveCommentsData = function () {
  let dataToSave = JSON.stringify(comments, ['name', 'comment', 'time'], 2);
  fs.writeFile('data/data.json', dataToSave, logError);
};

const logError = function (err) {
  if (err)
    console.log(err);
};

let logRequest = (req, res) => {
  let text = ['--------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${JSON.stringify((req.headers))}`,
    `COOKIES=> ${JSON.stringify((req.cookies))}`,
    `BODY=> ${JSON.stringify((req.body))}`, ''].join('\n');
  fs.appendFile('request.log', text, () => { });
  console.log(`${req.method} ${req.url}`);
}

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
  if (req.user)
    delete req.user.sessionId;
  res.setHeader('Set-Cookie', `sessionId=0; Expires=${new Date(1).toUTCString()}`);
  res.redirect('/index.html');
}

const serveGuestbook = function (req, res) {
  let page = fs.readFileSync('public/guestbook.html', 'utf8')
  if (isUserLoggedIn(req)) {
    let userName = req.user.name;
    commentFormUser = commentForm.replace('NAME_USER', userName);
    page = page.replace('COMMENTFORM', commentFormUser);
  } else {
    page = page.replace('COMMENTFORM', loginButton);
  }
  res.setHeader('content-type','text/html');
  res.write(page);
  res.end();
}

app.use(logRequest);
app.use(loadSession);
app.get('/', (req, res) => res.redirect('index.html'));
app.post('/addcomment', saveComment);
app.get('/guestbook.html', serveGuestbook);
app.get('/data', sendCommentData);
app.post('/login', loginUser);
app.get('/logout', logoutUser);
app.postProcess(serveStaticFile);

const server = http.createServer(app);
server.listen(PORT);
console.log('Listening on port ' + PORT);
