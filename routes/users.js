const express = require('express');
const passport = require('passport');
const router = express.Router();
const middleware=require('../middleware');
const users=require('../controller/users')

router.route('/signin').get(users.renderLogin).post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin'}),users.login);
router.route('/signup').get(users.renderRegister).post(users.register);
router.get('/logout', users.logout);
module.exports = router;