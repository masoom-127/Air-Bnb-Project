const Listing = require('./models/Listing');
const Review = require('./models/review');

 

//this is middleware to check the user is login or not
module.exports.islogin = (req, res, next) => {
    // console.log(req.path, '..',req.originalUrl);
    if (!req.isAuthenticated()) {
        //redirect url
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'yoou must be logined in to create listing')
        return res.redirect("/login");
    }
    next();

}

module.exports.saveredirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    const listings = await Listing.findById(id);

    if (!listings.owner._id.equals(req.user._id)) {
        req.flash("error", "You are not owner of this listing");
        return res.redirect(`/lists/${id}`);
    }

    next();
};



module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewsId } = req.params

    let review = await Review.findById(reviewsId)
    if (!review.author.equals(res.locals.currtUser._id)) {
        req.flash('error', 'you are not author of the reviews ')
        return res.redirect(`/lists/${id}`)
    }
    next();



}


 

module.exports.geocodeLocation = async (req,res,next)=> {
  try {
    const location = req.body.listing?.location;

    // If no location provided
    if (!location) return next();

    // If already has geometry, skip
    // if (req.body.listing.geometry) return next();

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('what came to respinse',data)

    if (!data.length) {
      req.flash("error", "Invalid location");
      return res.redirect("back");
    }

    // Attach geometry
    req.body.listing.geometry = {
      type: "Point",
      coordinates: [
        parseFloat(data[0].lon),
        parseFloat(data[0].lat)
      ]
    };

    next();

  } catch (err) {
    console.log(err);
    next(err);
  }
}


module.exports.autoFixGeometry = async  (req, res, next)=> {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return next();
    }

    // Already has geometry → skip
    if (listing.geometry && listing.geometry.coordinates.length) {
      res.locals.listing = listing;
      return next();
    }

    // No geometry → convert location to coordinates
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${listing.location}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.length) {
      res.locals.listing = listing;
      return next();
    }

    listing.geometry = {
      type: "Point",
      coordinates: [
        parseFloat(data[0].lon),
        parseFloat(data[0].lat)
      ]
    };

    await listing.save();

    res.locals.listing = listing;
    next();

  } catch (err) {
    next(err);
  }
};
