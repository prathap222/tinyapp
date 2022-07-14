const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookie = require('cookie-parser')
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookie());

const {verifyShortUrl, randomString, getUserByEmail, adduser, fetchUserInfo} = require('./helperFunctions'); 


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const currentUser = cookie => {
  for (let user in users) {
    if (cookie === users[user]["id"]) {
      return users[user]["email"];
    }
  }
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
 let templateVars = { urls: urlDatabase, current_user: currentUser(req.cookies['user_id'])};
  res.render("urls_index", templateVars);
});
// new url is created
app.get("/urls/new", (req, res) => {
  const current_user = currentUser(req.cookies['user_id'])
  if (!current_user) {
    res.redirect('/login');
  }
  
  let templateVars = { current_user: current_user }
  res.render("urls_new", templateVars);
});

// new page 
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL, urlDatabase)) {
    let longURL = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL: shortURL, longURL: longURL , current_user: currentUser(req.cookies['user_id'])};
    res.render("urls_show", templateVars);
  } else {
    res.send('does not exist');
    res.redirect('/urls')
  }
});

//new url added to shown with all urls
app.post("/urls", (req, res) => {
  const shortURL = randomString();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);         
});

// redirect to longRIL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL, urlDatabase)) {
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

// endpoint for get register
app.get("/register", (req, res) => {
  templateVars = { current_user: currentUser(req.cookies['user_id'])}
  res.render("urls_register", templateVars);
  res.redirect('/urls');
});

// endpoint for post register
app.post("/register", (req, res) => {
  const {password} = req.body;
  const email = req.body['email']
  if (email === '') {
    res.status(400).send('Email required');
  } else if (password === '') {
    res.status(400).send('Password required');
  } else if (!getUserByEmail(email, users)) {
    res.status(400).send('This email is already registered')
  } else {

  newuser = adduser(req.body, users)
  res.cookie('user_id', newuser.id);
  res.redirect('/urls');
  }
});

// to get login 
app.get("/login", (req, res) => {
  templateVars = { current_user: currentUser(req.cookies['user_id']) }
  res.render("login", templateVars);
})


// to post login 
app.post("/login", (req, res) => {
  const emailUsed = req.body['email'];
  const pwdUsed = req.body['password'];
  if (fetchUserInfo(emailUsed, users)) {
    const pwd = fetchUserInfo(emailUsed, users).password;
    const user_id = fetchUserInfo(emailUsed, users).id;
    if (pwd !== pwdUsed) {
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
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});