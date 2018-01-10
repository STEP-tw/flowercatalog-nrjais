const http = require('http');
const serveStaticFile = require('./file.js').serveStaticFile;
const logRequest = require('./log.js').logRequest;
const webapp = require('./webapp');
let lib = require('./serverLib');
let PORT = 9999;

let app = webapp();

app.use(logRequest);
app.use(lib.loadSession);
app.use(lib.redirectIfNotLoggedIn);

app.get('/', (req, res) => res.redirect('index.html'));
app.post('/addcomment', lib.saveComment);
app.get('/guestbook.html', lib.serveGuestbook);
app.get('/data', lib.sendCommentData);
app.post('/login', lib.loginUser);
app.get('/logout', lib.logoutUser);

app.postProcess(serveStaticFile);

const server = http.createServer(app);
server.listen(PORT);
console.log('Listening on port ' + PORT);
