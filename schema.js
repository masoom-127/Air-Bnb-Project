const Joi = require("joi");
const review = require("./models/Review");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().allow("", null),
    image: Joi.string().allow("", null), // optional image URL
     geometry: Joi.object({
      type: Joi.string().valid("Point").required(),
      coordinates: Joi.array()
        .items(Joi.number())
        .length(2)
        .required()
    }).optional()
  }).required()
});

 


module.exports.reviewSchema=Joi.object({
  review:Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment:Joi.string().required(),
  }).required(),
})