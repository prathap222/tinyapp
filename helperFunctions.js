const verifyShortUrl = (URL, database) => {
  return database[URL];
};

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


const randomString = () => {
  let ranString = '';
  while (ranString.length < 6) {
    ranString += generateRandomString();
  }
  return ranString;
};

const addUser = (newuser,userslist) => {
  const userid = randomString();
  newuser.id = userid;
  userslist[newuser.id] = newuser;
  console.log(userslist);
  return newuser;
};

const isUserValid = (email, userslist) => {
  for (let user in userslist) {
    if (userslist[user]["email"] === email) {
      return true;
    }
  }
  return false;
};

const getUserInfo = (email, users) => {
  for (let key in users) {
    if (users[key]['email'] === email) {
      return users[key];
    }
  }
};

const getUserEmail = (userId, users) => {
  for (let user in users) {
    if (userId === users[user]['id']) {
      return users[user]['email'];
    }
  }
};

const getUserId = (userId, users) => {
  for (let user in users) {
    if (userId === users[user]['id']) {
      return users[user]['id'];
    }
  }
};

const urlsForUser = (id, users) => {
  let currentUserId = id;
  let usersURLs = {};
  for (let key in users) {
    if (users[key].userID === currentUserId) {
      usersURLs[key] = users[key];
    }
  }
  return usersURLs;
};

const checkOwner = (userId, urlID, database) => {
  return userId === database[urlID]['userID'];
};


module.exports = { verifyShortUrl, randomString, isUserValid, addUser, getUserInfo, getUserEmail, urlsForUser, getUserId, checkOwner };