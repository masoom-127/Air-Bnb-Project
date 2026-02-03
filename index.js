if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
    console.log(process.env.PORT);
    console.log(process.env.DB_URL);
    console.log(process.env.secret);

}




const express = require('express')
const app = express()
const router = express.Router();
const mongoose = require('mongoose')
const Listing = require('./models/Listing');
const path = require('path')
const methodOverride = require('method-override')
const ejsmate = require('ejs-mate');
const wrapAsync = require('./util/wrapAsync')
const ExpressError = require('./util/ExpressError')
const { listingSchema } = require("./schema");
const reviews = require('./routes/review')
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const { date } = require('joi');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/User')
const userRouter = require('./routes/user')
const bookingRoutes = require('./routes/booking');
const { islogin, isOwner, saveredirectUrl, geocodeLocation, autoFixGeometry } = require('./middleware')
const multer = require('multer')
const { storage } = require('./cloudConfig')
const upload = multer({ storage })







//   const monogosh_url = 'mongodb://127.0.0.1:27017/wonderful'
const dbUrl = process.env.atlasdb_url

async function main() {
    mongoose.connect(dbUrl)
}
main().then(() => {
    console.log('connect to db')
}).catch((err) => {
    console.log(err)
})

app.use(router);

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.secret,
    },
    touchAfter: 24 * 3600,   // this is fine, but note: touchAfter is deprecated in newer versions → consider removing later
});
store.on('error', () => {
    console.log('error in mongo session store ', err)

})
console.log(MongoStore)
const sessionoptions = {
    store,
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true

    }
};



app.use(session(sessionoptions))
app.use(flash())
//passport authenications
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success")//this is the middleware to the have to add the create flash massage 
    res.locals.error = req.flash('error')
    res.locals.currtUser = req.user;
    next();
})


// this is the authenction of the new user is like demo test 
// app.get('/demouser',async(req,res)=>{
//     let fakeUser= new User({
//         email:'student@gmail.com',
//         username:'delta-student'
//     })

//     let registeruser=await  User.register(fakeUser,'helloworld');
//     res.send(registeruser)

// })


app.use('/listings/:id/reviews', reviews);
app.use('/', userRouter);
app.use("/lists/:id/book", bookingRoutes);
app.use("/", bookingRoutes);

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsmate);
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    res.send('app is working')
})


const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errmsg = error.details
            .map(el => el.message)
            .join(', ');

        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};




app.get('/list', wrapAsync(async (req, res, next) => {

    let alldata = await Listing.find({})
    res.render('./listings/index.ejs', { alldata })


})
);

app.get('/lists', wrapAsync(async (req, res) => {

    const { q } = req.query;
    if (!q || q.trim() === "") {
        const allListings = await Listing.find({});
        return res.redirect('/list')
    }

    let query = {
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    };

    // If q is number → search price
    if (!isNaN(q)) {
        query.$or.push({ price: Number(q) });
    }

    const listings = await Listing.find(query);

    res.render("listings/index.ejs", { alldata: listings });
}))

app.get('/lists/new', islogin, (req, res, next) => {

    // if(!req.isAuthenticated()){
    //     req.flash('error','yoou must be logined in to create listing')
    //     return res.redirect("/login");
    // }

    res.render('./listings/new.ejs')
    // next(new ExpressError(404, 'Page not found'));

})



app.get('/lists/:id', autoFixGeometry, wrapAsync(async (req, res) => {
    console.log(req.path, '..', req.originalUrl);
    let { id } = req.params

    console.log(id)
    const listing = await Listing.findById(id).populate({
        path: 'reviews', populate: { path: "author" },
    }).populate('owner')

    if (!listing) {
        req.flash('error', 'listing you requested for does not exit ')
        res.redirect('/list')
    }



    console.log(listing.geometry.coordinates)
    res.render('./listings/show.ejs', { listing })
})
);


app.post('/listings',
    islogin,

    upload.single('listing[image]'), geocodeLocation, validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params
        let url = req.file.path
        let filename = req.file.filename
        console.log(url, '..', filename)





        console.log("Logged user:", req.user);

        const newListing = new Listing(req.body.listing);

        console.log("Logged user:", req.user);
        newListing.owner = req.user._id;
        newListing.image = { url, filename }


        await newListing.save();
        req.flash("success", "New listing created");

        res.redirect("/list");
    }));


// app.post('/listings', upload.single('listing[image]'), (req, res) => {
//     console.log(req.file);   // uploaded file
//     console.log(req.body);   // form fields
//     res.send(req.file);
//     req
// });


app.get('/listings/:id/edit', islogin, isOwner, wrapAsync(async (req, res) => {
    console.log(req.path, '..', req.originalUrl);
    let { id } = req.params
    console.log(id)
    let listing = await Listing.findById(id)
    console.log(listing)
    if (!listing) {
        req.flash('error', 'listing you requested for does not exit ')
        res.redirect('/list')
    }
    res.render('./listings/edit.ejs', { listing })
}))


app.put(
    "/listings/:id",
    islogin,
    isOwner,
    upload.single("listing[image]"), geocodeLocation,
    validateListing,
    wrapAsync(async (req, res) => {

        const { id } = req.params;
        const { listing } = req.body;

        // Get existing listing
        const listings = await Listing.findById(id);

        // Update text fields
        Object.assign(listings, listing);

        // If new image uploaded
        if (req.file) {
            listings.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await listings.save();

        req.flash("success", "Listing updated");
        res.redirect(`/lists/${id}`);
    })
);



app.delete('/del/:id', islogin, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params
    let del = await Listing.findByIdAndDelete(id)
    console.log(id, 'hello')
    req.flash('success', 'deleted the listings')

    res.redirect("/list");
})
)


app.all('/*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found it beacuse masoom'));  // Fixed typo: 'gound' → 'found'
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    //   res.status(statusCode).send({message});            
    // res.status(statusCode).render('error', { message });
    res.status(statusCode).render('error', { message })
});

app.listen(8080, () => {
    console.log('listen server 8080')

})