const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../util/wrapAsync");
const { islogin } = require("../middleware");

const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

/* SHOW BOOKING FORM */
router.get("/:id/book", islogin, wrapAsync(async (req, res) => {

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/list");
  }

  res.render("Bookings/new", {
    listing,
    user: req.user
  });

}));



/* SAVE BOOKING */
router.post("/:id/book", islogin, wrapAsync(async (req, res) => {

  const { checkIn, checkOut, guests } = req.body;

  const booking = new Booking({
    listing: req.params.id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests
  });

  await booking.save();

  req.flash("success", "Booking Confirmed!");
  res.redirect(`/lists/${req.params.id}`);

}));


/* USER BOOKINGS PAGE */
router.get("/user/my", islogin, wrapAsync(async (req, res) => {

  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing");
    console.log(bookings)

  res.render("Bookings/my", { bookings });

}));


module.exports = router;
