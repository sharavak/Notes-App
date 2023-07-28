const User = require('../models/users');
const passport = require('passport');
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();
module.exports.renderRegister = (req, res, next) => {
  res.render('user/register');
}
module.exports.register = async (req, res, next) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    req.flash("error", 'Please enter the fields!');
    return res.redirect('/signup');
  }
  try {
    const { wellFormed, validDomain, validMailbox } = await emailValidator.verify(email, 100);
    if (wellFormed && validDomain) {
      const user = new User({ email, username });
      const registerUser = await User.register(user, password);
      req.login(registerUser, err => {
        if (err) {
          req.flash('error', 'Email is already registered');
          return res.redirect('/signup');
        }
        req.flash('success', 'Welcome to Notes App!');
        return res.redirect('/show');
      })
    } else {
      req.flash('error', 'Invalid Email!!!');
      return res.redirect('/signup');

    }
  } catch (e) {
    req.flash('error', 'Email already registered');
    return res.redirect('/signup');
  }
}

module.exports.renderLogin = (req, res) => {
  return res.render('user/signin');
}
module.exports.login = async (req, res) => {
  req.flash("success", 'Welcome Back!!!');
  res.redirect('/show');
};
module.exports.logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.render('error');
    }
    req.flash('success', "Successfully signed out!!!");
    res.redirect('/');
  });

}
