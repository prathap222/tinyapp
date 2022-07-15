const { assert, use } = require('chai');

const { isUserValid, getUserInfo, getUserEmail, getUserId } = require('../helperFunctions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('isUserValid', function() {
  it('should return true if the given user is available', function() {
    const user = isUserValid("user@example.com", testUsers);
    assert.isTrue(user);
  });

  it('should return false if the given user is not available', function() {
    const user = isUserValid("pra@example.com", testUsers);
    assert.isFalse(user);
  });
});

describe('getUserEmail', function() {
  it('should return given users email', function() {
    const user = getUserEmail("userRandomID", testUsers);
    const expectedUserEmail = "user@example.com";
    assert.strictEqual(user, expectedUserEmail);
  });
});

describe('getUserId', function() {
  it('should return given users id', function() {
    const user = getUserId("userRandomID", testUsers);
    const expectedUserId = "userRandomID";
    assert.strictEqual(user, expectedUserId);
  });
});

describe('getUserInfo', function() {
  it('should return the user details based on the given email (assert id)', function() {
    const user = getUserInfo("user@example.com", testUsers);
    const expectedUserId = "userRandomID";
    assert.strictEqual(user.id, expectedUserId);
  });
  it('should return the user details based on the given email (assert email)', function() {
    const user = getUserInfo("user@example.com", testUsers);
    const expectedUserEmail = "user@example.com";
    assert.strictEqual(user.email, expectedUserEmail);
  });


});