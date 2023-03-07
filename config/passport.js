const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("Serialize user");
  //the id in mongodb is saved as _id
  //the done function below does two things,
  //1. save the saved id in mongodb in session , and sign the id and transfer it to the cookie, then send it to the user
  //2. set the req.isAuthenticated() = true
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  console.log(
    "Deserializing user, using the id saved in serializeUser to find the data that save in the database"
  );
  let foundUser = await User.findOne({ _id });
  //the done function in deserializeUser, the second parameter was been designed to in req.user
  // here, the function below use foundUser to be the property of req.user
  done(null, foundUser);
});

//GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google Strategy");
      //   console.log(profile);
      //   console.log("==================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("User found, user had already enrolled in ");
        //2 parameters should be placed in done , 1->null 2->the promise you want to serialize
        done(null, foundUser);
      } else {
        console.log("New user detected");
        try {
          let newUser = new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          });
          let savedUser = await newUser.save();
          console.log("New user has been saved");

          done(null, savedUser);
        } catch (e) {
          console.log(e);
        }
      }
    }
  )
);

//LocalStrategy
passport.use(
  new LocalStrategy(
    //the name(property) of the username and password must be name = "username" name = "password" to match the local strategy
    async (username, password, done) => {
      let foundUser = await User.findOne({ email: username });
      if (foundUser) {
        let result = await bcrypt.compare(password, foundUser.password);
        if (result) {
          done(null, foundUser);
        } else {
          done(null, false);
        }
      } else {
        done(null, false);
      }
    }
  )
);
