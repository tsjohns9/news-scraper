const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const UserSchema = new Schema({
  // `name` must be unique and of type String
  username: {
    type: String,
    unique: true
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
UserSchema.methods.createUser = function(newUser) {
  // hashes password
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      // Store hash as the password.
      newUser.password = hash;

      // Saves user to db
      newUser
        .save()
        .then(res => console.log(res))
        .catch(err => console.log(err));
    });
  });
};

// check password when signing in
UserSchema.methods.comparePassword = function() {
  //
};

// get user on successful sign in
UserSchema.methods.getUser = function() {
  //
};

// check if the user exists before creating a new one
UserSchema.methods.checkUser = function() {
  //
};

// This creates our model from the above schema, using mongoose's model method
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
