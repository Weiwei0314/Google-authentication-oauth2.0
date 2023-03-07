const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  //to prevent other registration such as postman
  if (password.length < 8) {
    req.flash(
      "error_msg",
      "Password should have at least 8 chars with numbers or letters"
    );
    return res.redirect("/auth/signup");
  }

  //check the email was registered or not
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "The email had been registered, please use another email or use different email to login."
    );
    return res.redirect("/auth/signup");
  }
  //first parameter is the one you wanna hashes, the second is the salt round
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  let savedUser = await newUser.save();
  req.flash(
    "success_msg",
    "New account created, please use the account to login."
  );
  return res.redirect("/auth/login");
});

//using local strategy to login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    //failure flash will automatically add to req.locals.error in the index.js
    failureFlash: "Login failure. Account or the password incorrect.",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("enter the redirect region");
  res.redirect("/profile");
});

module.exports = router;
