const express = require('express')
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const wrapAsync = require('../util/wrapAsync');
const { saveredirectUrl } = require('../middleware')
const { renderSign, Sign, renderlogin, Login,logout } = require('../controllers/user')




router.get('/singup', renderSign)
router.post('/singup', wrapAsync(Sign))

router.get('/login', renderlogin)

router.post('/login',
    saveredirectUrl,
    passport.authenticate('local',
        { failureRedirect: '/login', failureFlash: true }), Login)
router.get('/logout',logout)


module.exports = router