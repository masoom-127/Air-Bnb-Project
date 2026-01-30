const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");
const { reviewSchema } = require("../schema");

const { islogin, isReviewAuthor } = require("../middleware");
const { createReview, reviewDestroys } = require("../controllers/reviews");

// Validate Review
const validaterReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errmsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errmsg);
  }
  next();
};
console.log("islogin:", typeof islogin);
console.log("validaterReview:", typeof validaterReview);
console.log("wrapAsync:", typeof wrapAsync);
console.log("createReview:", typeof createReview);
// Create Review
router.post(
  "/",
  islogin,
  validaterReview,
  wrapAsync(createReview)
);

// Delete Review
router.delete(
  "/:reviewsId",
  islogin,
  isReviewAuthor,
  wrapAsync(reviewDestroys)
);

module.exports = router;
