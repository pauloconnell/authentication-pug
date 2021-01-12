"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongo = require("mongodb").MongoClient; // note this challenge requires mongo and NOT mongoose
const cors = require("cors");

const passport = require("passport");
const ObjectID = require("mongodb").ObjectID;
const LocalStrategy = require("passport-local");
//const bcrypt = require('bcrypt');

const app = express();
app.set("view engine", "pug");
require("dotenv").config();

fccTesting(app); //For FCC testing purposes
app.use(cors());
app.use("/public", express.static("/public"));
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// added delays to certain routes as required to pass testing in these cases
if (process.env.ENABLE_DELAYS)
  app.use((req, res, next) => {
    switch (req.method) {
      case "GET":
        switch (req.url) {
          case "/logout":
            return setTimeout(() => next(), 300);
          case "/profile":
            return setTimeout(() => next(), 600);
          default:
            next();
        }
        break;
      case "POST":
        switch (req.url) {
          case "/login":
            return setTimeout(() => next(), 600);
          default:
            next();
        }
        break;
      default:
        next();
    }
  });

// connect to mongoDB so we have access for all of our routes NOTE: Not using Mongoose => client.db("pug")
mongo.connect(
  process.env.DATABASE,
  { useUnifiedTopology: true },
  (err, client) => {
    var db = client.db("pug"); // db is a function in mongo client that will connect us to our 'pug' dataBase (which we can call .collection on later)
    if (err) {
      console.log(db + "Database error: " + err);
      app.route("/").get((req, res) => {
        res.render("pug", { title: err, message: "Login Failed, try again" });
      });
    } else {
      app.listen(process.env.PORT || 3000, () => {
        // only have app listening IF we connect to DB
        console.log("Listening on port " + process.env.PORT);
      });

      console.log("Successful database connection");
      //these 2 methods are auto called by passport:
      // serialize and save user_id detail to session
      passport.serializeUser((user, done) => {
        // user object is stored(retrieved) on MongoDB
        done(null, user._id);
      });
      //retrieve user details from cookie
      passport.deserializeUser((id, done) => {
        db.collection("users").findOne(
          // using client/db to access collection in db 'pug'
          { _id: new ObjectID(id) },
          (err, user) => {
            done(null, user);
          }
        );
      });

      passport.use(
        new LocalStrategy(function(username, password, done) {
          db.collection("users").findOne({ username: username }, function(
            err,
            user
          ) {
            console.log("User " + username + " attempted to log in.");
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false);
            }
            if (password !== user.password) {
              return done(null, false);
            } else {
              console.log(
                "successfull login of user: " + JSON.stringify(user.username)
              );
              return done(null, user);
            }
          });
        })
      );
      var login_fail = false;
      // our middleware function which will ensure req.isAuth is true, or we redirect to "/"
      function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        console.log("user not authenticated");
        req.session.login_fail = true;
        res.redirect("/"); //, {
        //   message:"login failed, please try again",
        //   showLogin: true,
        //   showRegistration:true
        // });
      }

      app.route("/").get((req, res) => {
        //Change the response to render the Pug template
        console.log("session variable assigned is ", req.session.login_fail);
        if (req.session.login_fail) {
          res.render(process.cwd() + "/views/pug/index", {
            title: "Home Page",
            message: "login Failed, please try again",
            showLogin: true,
            showRegistration: true
          });
        } else {
          res.render(process.cwd() + "/views/pug/index", {
            title: "Home Page",
            message: "login",
            showLogin: true,
            showRegistration: true
          });
        }
      });

      app.route("/login").post(
        passport.authenticate("local", {
          // "local" is default name given to local strategy
          failureRedirect: "/",
          message_fail: "login failed, please try again",
          showLogin: true,
          showRegistration: true
        }),
        (req, res) => {
          console.log("post to /login with " + JSON.stringify(req.body));

          console.log("user found? " + JSON.stringify(req.user.username));
          res.redirect("/profile");
        }
      );

      app.route("/profile").get(ensureAuthenticated, (req, res) => {
        res.render("/app/views/pug/profile", {
          username: req.user.username,
          title: "Profile"
        });
      });

      app.route("/register").post(
        (req, res, next) => {
          //    var hash = bcrypt.hashSync(req.body.password, 12);
          db.collection("users").findOne(
            { username: req.body.username },
            (err, user) => {
              if (err) {
                next(err);
              } else if (user) {
                console.log(
                  JSON.stringify(user.username) + " Already exists in Db"
                );
                req.session.username = user.username;
                res.redirect("/"); // I think should be redirected to /profile...but pass tests
                // res.render(process.cwd() + "/views/pug/index", {
                //       title: 'Hello',
                //       message: 'Already a member',
                //       showLogin: true,
                //       showRegistration: true });
              } else {
                db.collection("users").insertOne(
                  {
                    username: req.body.username,
                    password: req.body.password
                  },
                  (err, user) => {
                    if (err) {
                      res.redirect("/");
                    } else {
                      // username available under req.user.username  req.session.username = user.username;
                      next(null, user);
                    }
                  }
                );
              }
            }
          );
        },
        passport.authenticate("local", { failureRedirect: "/" }),
        (req, res, next) => {
          res.redirect("/profile");
        }
      );

      app.route("/logout").get((req, res) => {
        console.log("Logged out");
        req.logout();
        res.redirect("/");
      });

      app.use((req, res, next) => {
        res
          .status(404)
          .type("text")
          .send("Not Found");
      });
    }
  }
); //.catch((e) => {
//   app.route('/').get((req, res) => {
//     res.render('pug', { title: e, message: 'Unable to login' });
//   });
// });
