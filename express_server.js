const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['userSession']
}));

const {verifyShortUrl, randomString, isUserValid, addUser, getUserInfo, getUserEmail, urlsForUser, getUserId, checkOwner } = require('./helperFunctions');


const urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', userID: 'prat123'},
  '9sm5xK': {longURL: 'http://www.google.com', userID: 'prat123'}
};

//database
const users = {
  'prat123': {id: 'prat123', email: 'prat@com', password: bcrypt.hashSync('123', 10)}
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// endpoint for get register
app.get('/register', (req, res) => {
  let currentUser = getUserEmail(req.session.userSession, users);
  if (currentUser) {
    res.redirect('/urls');
  } else {
    let templateVars = { currentUser: currentUser };
    res.render('urls_register', templateVars);
    res.redirect('/urls');
  }
});

// endpoint for post register
app.post('/register', (req, res) => {
  let email = req.body['email'];
  let password = req.body['password'];
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '') {
    res.status(400).send('Email required');
  } else if (password === '') {
    res.status(400).send('Password required');
  } else if (!isUserValid(email, users)) {
    res.status(400).send('This email is already registered');
  } else {
    req.body['password'] = hashedPassword;
    let newUser = addUser(req.body, users);
    req.session.userSession = newUser.id;
    res.redirect('/urls');
  }
});

// to get login
app.get('/login', (req, res) => {
  let currentUser = getUserEmail(req.session.userSession, users);
  if (currentUser) {
    res.redirect('/urls');
  } else {
    let templateVars = { currentUser: currentUser };
    res.render('login', templateVars);
  }
});

// to post login
app.post('/login', (req, res) => {
  let givenEmail = req.body['email'];
  let givenPassword = req.body['password'];
  if (getUserInfo(givenEmail, users)) {
    let fetchedPassword = getUserInfo(givenEmail, users).password;
    if (!bcrypt.compareSync(givenPassword, fetchedPassword)) {
      res.status(403).send('Error 403... re-enter your password');
    } else {
      req.session.userSession = getUserInfo(givenEmail, users).id;
      res.redirect('/urls');
    }
  } else {
    res.status(403).send('Error 403... email not found');
    res.redirect('/login');
  }
});

//endpoint to logout
app.post('/logout',(req,res) => {
  req.session.userSession = null;
  res.redirect('/login');
});

// disply all urls to main page
app.get('/urls', (req, res) => {
  let currentUser = getUserEmail(req.session.userSession, users);
  let userId = getUserId(req.session.userSession, users);
  if (!currentUser) {
    res.redirect('/register');
  }
  let userLinks = urlsForUser(userId, urlDatabase);
  let templateVars = { urls: userLinks, currentUser: getUserEmail(req.session.userSession, users) };
  res.render('urls_index', templateVars);
});

//this is to add new url to all urls page
app.post('/urls', (req, res) => {
  let currentUser = getUserEmail(req.session.userSession, users);
  if (!currentUser) {
    res.redirect('/login');
  } else {
    let userId = getUserId(req.session.userSession, users);
    let shortURL = randomString();
    let newURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: newURL, userID: userId };
    res.redirect(`/urls/${shortURL}`);
  }
});

// url is shown in new page
app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { currentUser: getUserEmail(req.session.userSession, users) };
  let currentUserId = getUserId(req.session.userSession, users);
  if (verifyShortUrl(shortURL, urlDatabase)) {
    if (currentUserId !== urlDatabase[shortURL].userID) {
      res.send('This url does not belong to you');
    } else {
      let longURL = urlDatabase[req.params.shortURL].longURL;
      let templateVars1 = { shortURL: shortURL, longURL: longURL, currentUser: getUserEmail(req.session.userSession, users)};
      res.render('urls_show', templateVars1);
    }
  } else {
    res.render('urls_new', templateVars);
  }
});

// new url key is created
app.get('/urls/new', (req, res) => {
  let currentUser = getUserEmail(req.session.userSession, users);
  if (!currentUser) {
    res.redirect('/login');
  } else {
    let templateVars = { currentUser: currentUser };
    res.render('urls_new', templateVars);
  }
});

//post route that edits a url resource: POST
app.post('/urls/:shortURL/edit',(req,res) => {
  if (!checkOwner(getUserId(req.session.userSession, users), req.params.shortURL, urlDatabase)) {
    res.send('This url does not belong to you');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

//redirect to longRIL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL, urlDatabase)) {
    let longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send('Does not exist');
  }
});

//post route that removes a url resource: POST
app.post('/urls/:shortURL/delete',(req,res) => {
  let currentUser = getUserId(req.session.userSession, users);
  let shortURL = req.params.shortURL;
  if (!checkOwner(currentUser, req.params.shortURL, urlDatabase)) {
    res.send('This url does not belong to you');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});