const mongoose = require('mongoose');
const Review = require('./Review');     // make sure this file exists

const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,   // ← better style (more explicit)
      ref: 'Review',
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true
      // You can add:   validate: { validator: v => v.length === 2 }
    }
  },
  category: {
    type: String,
    required: true
    // Optional: enum: ["Trending", "Rooms", "Iconic", "Mountains", ...]
  },
}, {
  timestamps: true    // optional but very useful (createdAt, updatedAt)
});

// Important: create & export the model
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;