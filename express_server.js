const express = require("express");
const app = express(); 
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookie = require('cookie-parser')
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookie());

const {verifyShortUrl, randomString, getUserByEmail, addUser, fetchUserInfo, currentUser, urlsForUser, currentUserId, checkOwner } = require('./helperFunctions'); 


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "prat123"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "prat123"}
};

//database
const users = {
  "prat123": {id: "prat123", email: "prat@com", password: "123"}
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// endpoint for get register
app.get("/register", (req, res) => {
  let current_user = currentUser(req.cookies['user_id'], users);
  if (current_user) {
    res.redirect('/urls');
  } else {
    templateVars = { current_user: current_user }
    res.render("urls_register", templateVars);
    res.redirect('/urls');
  }
});

// endpoint for post register
app.post("/register", (req, res) => {
  let password = req.body;
  let email = req.body['email'];
  if (email === '') {
    res.status(400).send('Email required');
  } else if (password === '') {
    res.status(400).send('Password required');
  } else if (!getUserByEmail(email, users)) {
    res.status(400).send('This email is already registered')
  } else {

  let newuser = addUser(req.body, users)
  res.cookie('user_id', newuser.id);
  res.redirect('/urls');
  }
});

// to get login 
app.get("/login", (req, res) => {
  let current_user = currentUser(req.cookies['user_id'], users);
  if (current_user) {
    res.redirect('/urls');
  } else {
    templateVars = { current_user: current_user };
    res.render("login", templateVars);
  }
});

// to post login 
app.post("/login", (req, res) => {
  let givenEmail = req.body['email'];
  let givenPwd = req.body['password'];
  if (fetchUserInfo(givenEmail, users)) {
    let pwd = fetchUserInfo(givenEmail, users).password;
    let user_id = fetchUserInfo(givenEmail, users).id;
    if (pwd !== givenPwd) {
      res.status(403).send('Error 403... re-enter your password')
    } else {
      res.cookie('user_id', user_id);
      res.redirect('/urls');
    }
  } else {
    res.status(403).send('Error 403... email not found')
  }
});

//endpoint to logout
app.post("/logout",(req,res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// disply all urls to main page
app.get("/urls", (req, res) => {
  let current_user = currentUser(req.cookies['user_id'], users);
  if (!current_user) {
    res.redirect('/register');
  }
  let userLinks = urlsForUser(current_user, urlDatabase);
  let templateVars = { urls: urlDatabase, current_user: currentUser(req.cookies['user_id'], users) };
  res.render("urls_index", templateVars);
});

//this is to add new url to all urls page
app.post("/urls", (req, res) => {
  let current_user = currentUser(req.cookies['user_id'], users);
  if (!current_user) {
    res.redirect('/login');
  } else {
    let userId = currentUserId(req.cookies['user_id'], users);
    let shortURL = randomString();
    const newURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: newURL, userID: userId };
    res.redirect(`/urls/${shortURL}`);
  }
});

// url is shown in new page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { current_user: currentUser(req.cookies['user_id'], users) }
  const current_user_id = currentUserId(req.cookies['user_id'], users);
  if (verifyShortUrl(shortURL, urlDatabase)) {
    if (current_user_id !== urlDatabase[shortURL].userID) {
      res.send('This url does not belong to you');
      } else {
        const longURL = urlDatabase[req.params.shortURL].longURL;
        const templateVars1 = { shortURL: shortURL, longURL: longURL, current_user: currentUser(req.cookies['user_id'], users)};
        res.render("urls_show", templateVars1);
      }
    } else {
    res.render("urls_new", templateVars);
  }
});

// new url key is created
app.get("/urls/new", (req, res) => {
  let current_user = currentUser(req.cookies['user_id'], users);
  if (!current_user) {
    res.redirect('/login');
  } else {
    let templateVars = { current_user: current_user };
    res.render("urls_new", templateVars);
  } 
});

//post route that edits a url resource: POST
app.post("/urls/:shortURL/edit",(req,res) => {
  if (!checkOwner(currentUserId(req.cookies['user_id'], users), req.params.shortURL, urlDatabase)) {
    res.send('This url does not belong to you')
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls')
});

//redirect to longRIL
app.get("/u/:shortURL", (req, res) => {
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
app.post("/urls/:shortURL/delete",(req,res) => {
  // let current_user = currentUserId(req.cookies['user_id'], users);
  let shortURL = req.params.shortURL;
  if (!checkOwner(currentUserId(req.cookies['user_id'], users), req.params.shortURL, urlDatabase)) {
    res.send('This url does not belong to you')
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});