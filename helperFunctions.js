//These are helper functions
//this will show if short url exists
const verifyShortUrl = (URL, database) => {
  return database[URL];
};

// this will generate a unique url, string random alphaNumeric values
// index is betwen 0 and 61 as 62 is our alphaNumeric
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



//helper function: add user if not available
const addUser = (newuser,userslist) => {
  const userid = generateRandomString();
  newuser.id = userid;
  userslist[newuser] = newuser;
  return newuser
}

//helpfer function: to check if emails are registered
const getUserByEmail = (email, userslist) => {
  for (let user in userslist) {
    if(userslist[user]["email"] === email) {
      return false;
    }
  }
  return true;
};

const fetchUserInfo = (email, database) => {
  for (key in database) {
    if (database[key]['email'] === email) {
      return database[key];
    }
  }
};

const currentUser = (cookie, users) => {
  for (let user in users) {
    if (cookie === users[user]['id']) {
      return users[user]['email'];
    }
  }
};

const currentUserId = (cookie, users) => {
  for (let user in users) {
    if (cookie === users[user]['id']) {
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
  console.log('this is shortURL', urlID)
  return userId === database[urlID]['userID']
}


module.exports = { verifyShortUrl, randomString, getUserByEmail, addUser, fetchUserInfo, currentUser, urlsForUser, currentUserId, checkOwner }  