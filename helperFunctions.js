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
  let randomString = '';
  while (randomString.length < 6) {
    randomString += generateRandomString
  }
  return randomString;
};



//helper function: add user if not available
const adduser = (newuser,userslist) => {
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
      return database[key]
    }
  }
}



module.exports = { verifyShortUrl, randomString, getUserByEmail, adduser, fetchUserInfo }  