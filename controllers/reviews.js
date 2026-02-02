const Review = require('../models/Review')
const Listing = require('../models/Listing');


module.exports.createReview = async (req, res) => {
    console.log('he', req.params.id)
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review)

    newReview.author = req.user._id
    console.log(newReview)
    listing.reviews.push(newReview)
    await newReview.save();
    await listing.save()
    console.log('new res saved')
    req.flash('success', 'reviews is created ')
    res.redirect(`/lists/${listing._id}`)

}

module.exports.reviewDestroys = async (req, res) => {
    let { id, reviewsId } = req.params;
    console.log(id, reviewsId)
    let data = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } })
    console.log(data)
    await Review.findByIdAndDelete(reviewsId)
    req.flash('success', 'reviews is deleted ')
    res.redirect(`/lists/${id}`);
    // res.send('hello')

}
