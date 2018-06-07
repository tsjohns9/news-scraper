const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const UserSchema = new Schema({
  // `name` must be unique and of type String
  username: {
    type: String
  },
  password: {
    type: String
  },
  // `notes` is an array that stores ObjectIds
  // The ref property links these ObjectIds to the Note model
  // This allows us to populate the User with any associated Notes
  notes: [
    {
      // Store ObjectIds in the array
      type: Schema.Types.ObjectId,
      // The ObjectIds will refer to the ids in the Note model
      ref: 'Note'
    }
  ]
});

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

function getUserById(id, callback) {
  User.findById(id, callback);
}
// This creates our model from the above schema, using mongoose's model method
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = { User, getUserById };
