const router = require("express").Router();
const passport = require("passport");
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

//since the profile was available after login, authCheck middleware is appropriate here
router.get("/", authCheck, async (req, res) => {
  //req.user had been set in deserializeUser
  let postFound = await Post.find({ author: req.user._id }).exec();
  res.render("profile", { user: req.user, posts: postFound });
});

//post articles routes in profile
router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    let savedPost = await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "Title and the content are both needed.");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
