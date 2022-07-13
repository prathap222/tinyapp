const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookie = require('cookie-parser')
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookie());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
// disply all urls to main page
app.get("/urls", (req, res) => {
 let templateVars = { urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
});
// new url is created
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req. cookies['username']}
  res.render("urls_new", templateVars);
});

// new page 
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL)) {
    let longURL = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL: shortURL, longURL: longURL , username: req.cookies['username']};
    res.render("urls_show", templateVars);
  } else {
    res.send('does not exist');
    res.redirect('/urls')
  }
});

//new url added to shown with all urls
app.post("/urls", (req, res) => {
  const shortURL = generateShortURL();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);         
});

// redirect to longRIL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send('Does not exist');
  }
});

//post route that removes a url resource: POST
app.post("/urls/:shortURL/delete",(req,res) => {
  const urlTodelete = req.params.shortURL;
  delete urlDatabase[urlTodelete];
  res.redirect('/urls');
});

//post route that edits a url resource: POST
app.post("/urls/:shortURL/edit",(req,res) => {
  const urlToEdit = req.params.shortURL;
  urlDatabase[urlToEdit] = req.body.longURL;
  res.redirect('/urls');
});

//endpoint to login
app.post("/login", (req, res) => {
  if (req.body.username) {
    const username = req.body.username;
    res.cookie('username', username);
  }
  res.redirect('/urls');
});

//endpoint to logout
app.post("/logout",(req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = lowerCase.toUpperCase();
  const numeric = '1234567890';
  const alphaNumeric = lowerCase + upperCase + numeric;
  //alphaNumeric is 62
  let index = Math.round(Math.random() * 100);
  if (index > 61) {
    while (index > 61) {
      index = Math.round(Math.random() * 100);
    }
  }
  return alphaNumeric[index];
};

//generate a unique url, string random alphaNumeric values
const generateShortURL = () => {
  let randomString = '';
  while (randomString.length < 6) {
    randomString += generateRandomString();
  }
  return randomString; };


//this will show if short url exists
const verifyShortUrl = URL => {
  return urlDatabase[URL];
};