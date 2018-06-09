const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
const UserSchema = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },

  // stores an array of saved articles for each user
  savedArticles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ]
});

// saves an article and associates it with the user.
UserSchema.methods.savedArticle = function(articleId, userId, callback) {
  User.update({ _id: userId }, { $addToSet: { savedArticles: articleId } }, { new: true })
    .then(res => callback(res, null))
    .catch(err => callback(null, res));
};

// gets all saved articles from the user.
UserSchema.methods.getSavedArticles = function(userId, obj, callback) {
  // passed in the object to render data to the view
  // callback deals with success and error cases.
  const infoObject = obj;
  User.find({ _id: userId })
    .populate('savedArticles')
    .then(res => callback(res, null, infoObject))
    .catch(err => callback(null, err, infoObject));
};

// removes the saved article from the user based on user id, and article id.
UserSchema.methods.removeSavedArticle = function(articleId, userId, callback) {
  // cb deals with success and error handling
  // find the user, remove the articles based on the article id inside of the savedArticles array
  User.update({ _id: userId }, { $pull: { savedArticles: { $in: [articleId] } } })
    .then(result => callback(result, null))
    .catch(err => callback(null, err));
};

// creates new user
UserSchema.methods.createUser = function(newUser, callback) {
  const cb = callback;
  // hashes password
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      // Store hash as the password.
      newUser.password = hash;

      // Saves user to db
      newUser
        .save()
        .then(res => cb())
        .catch(err => console.log('ERR:', err));
    });
  });
};

// checks if a user exists at sign up
UserSchema.methods.checkIfUserExists = function(potentialUser, callback) {
  User.findOne({ username: potentialUser.username }, callback);
};

// check password when signing in
UserSchema.methods.checkPassword = function(plainPass, hash, callback) {
  bcrypt.compare(plainPass, hash, function(err, isMatched) {
    callback(null, isMatched);
  });
};

// get user on successful sign in
UserSchema.methods.findByUserName = function(user, callback) {
  User.findOne({ username: user }, callback);
};

// passport uses this to serialize and de-serialize a session
UserSchema.statics.getUserById = function(id, callback) {
  User.findById(id, callback);
};
// This creates our model from the above schema, using mongoose's model method
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
