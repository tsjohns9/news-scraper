const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
const UserSchema = new Schema({
  username: {
    type: String,
    unique: true
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

// hashes a user password after successful creation
UserSchema.methods.hashPassword = function(newUser, callback) {
  const cb = callback;
  // hashes password
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      // Store hash as the password.
      newUser.password = hash;

      // Saves user to db
      newUser
        .save()
        .then(() => cb())
        .catch(err => console.log('ERR:', err));
    });
  });
};

// check password when signing in
UserSchema.methods.checkPassword = function(plainPass, hash, callback) {
  bcrypt.compare(plainPass, hash, function(err, isMatched) {
    callback(null, isMatched);
  });
};

// passport uses this to serialize and de-serialize a session
UserSchema.statics.getUserById = function(id, callback) {
  User.findById(id, callback);
};

// This creates our model from the above schema, using mongoose's model method
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
