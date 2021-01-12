# **FreeCodeCamp**

## Introduction to Advanced Node and Express Challenges

[![Run on Repl.it](https://repl.it/badge/github/freeCodeCamp/boilerplate-advancednode)](https://repl.it/github/freeCodeCamp/boilerplate-advancednode)

We will continue on the path of exploring [ExpressJS](http://expressjs.com/) functionality including working with middleware packages in our Express Application.

Authentication is the process or action of verifying the identity of a user or process. Up to this point you have not been able to create an app utilizing this key concept.

The most common and easiest way to use authentication middleware for Node.js is [PassportJS](https://passportjs.org/). It is easy to learn, light-weight, and extremely flexible allowing for many strategies, which we will talk about in later challenges. We will also explore template engines, specifically [PugJS](https://pugjs.org/api/getting-started.html), and web sockets, [Socket.io](https://socket.io/). Web sockets allow for real time communication between all your clients and your server. Working on these challenges will involve writing your code on Repl.it using our starter project. After completing each challenge you can copy your public Repl.it url (the homepage of your Repl.it app) into the challenge screen to test it! Optionally, you may choose to write your project on another platform but it must be publicly visible for our testing.

Start this project on Repl.it using this link or clone this repository on [GitHub](https://github.com/freeCodeCamp/boilerplate-advancednode)! If you use Repl.it, remember to save the link to your project somewhere safe.

# Design Documentation :

## Title and People

### Author: Paul O'Connell

Reviewer:
Last Updated: Jan 11 2021

## Overview

App uses authentication to allow users to log in, and pug to render active content to routes

## Goals and Non-Goals

GOALS - see readme,
NON-GOALS- anything beyond simply login access secure profile and logout

## Milestones

Start Date:

Milestone 1 — DONE Complete and pass tests
Milestone 2 - update error message on failed login 
Milestone 3 - update CSS to upgrade look
End Date:
Milestone 4 - Future project(non-goal) -add CSS and images to create look and feel of real app

## Existing Solution/User Story

See UserStories @ index.html

# Design patern here:
```
Body-parser gets fields for name and password from form submit makes them available on req.body.name ect
Session - store (serialize) user_id onto secure cookie * browser specific - cookie save on browser, once browser is closed, cookie destroyed.
Passport - authentication- local strategy used w/mongodb, de&serialize user details to cookie/req.user allows login, ensureAuth, and logout
MONGO DB - connection is made at start of API routes in server.js, and all routes are included in that connection
Register - POST => /register req.body has name and password,
              hits db to check if name exists already redirect to / if exists already
              saves details to db which gives _id
Login - Post=>/Login req.body has name and password, so Passport.authenticate (or req.login()) middleware takes req.body.name/password and passes them to our 'local' strategy 
          which: hit db for name, if we get a doc, ensure password is correct we get our doc
        The user doc is now serialized and available to any of our routes on req.user        
Middleware - we make ensureAuthenticated() middleWare Function to be added to profile route to ensure current req.user / is logged in
Profile - loads profile page, pass variables from req.user to pug to render (ie. req.user.username)
Logout - simple handled by passport with req.logout();
```

## Alternative Solutions

Pros/Cons of Alternatives - also can we use 3rd party/open source solution?

Testability, Monitoring and Alerting:

detail: testing

Cross-Team Impact:

negative consequences/security vulnerabilities - cost\$\$\$, support burden?

Open Questions

Known Unknowns

## Detailed Scoping and Timeline (Used by dev team during creation)
Great resource for Passport Documentation:
https://github.com/jwalton/passport-api-docs#passportinitialize
