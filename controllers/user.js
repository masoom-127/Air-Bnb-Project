const User = require('../models/User');

module.exports.renderSign= (req, res) => {
    res.render('user/signup.ejs')
};

module.exports.Sign=async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username })
        console.log(email, username)
        const registeruser = await User.register(newUser, password)
        console.log(registeruser)
        req.login(registeruser, (err) => {
            if (err) {
                return next(err)
            }
            req.flash('success', 'welcome to wonderlust')
            res.redirect("/list");

        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/singup')

    }

};


module.exports.renderlogin=(req, res) => {
    res.render('user/login.ejs')
}

module.exports.Login=async (req, res) => {
            req.flash('success', `Welcome back, ${req.user.username || 'user'}!`);
            let redirectUrl=res.locals.redirectUrl ||'/list';
            delete req.session.redirectUrl;
            res.redirect( redirectUrl);
        }

module.exports.logout=(req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'your are logged out now')
        res.redirect("/list");

    })



}