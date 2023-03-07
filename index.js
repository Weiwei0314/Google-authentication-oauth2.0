const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const { urlencoded } = require("body-parser");
require("dotenv").config();
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
require("./config/passport");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

//mongoose
async function main() {
  console.log("Success linking to mongodb.");
  await mongoose.connect(process.env.MONGODB);
}
mongoose.set("strictQuery", true);
main().catch((e) => {
  console.log(e);
});

//server
app.listen(8080, () => {
  console.log("Server is running on port 8080.");
});

//middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//router handling
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

//routes
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

//error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broken , we'll fix it soon.");
});

//commonly used error handler
app.get("/*", (req, res) => {
  res.status(404).send("404 page not found.");
});
