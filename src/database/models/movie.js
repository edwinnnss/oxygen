const mongoose = require('mongoose');

const { Schema } = mongoose;

const MovieSchema = new Schema({
  countries: [String],
  coverImageUrl: String,
  directors: [String],
  duration: String,
  genres: [String],
  keywords: [String],
  name: String,
  posterUrl: String,
  quality: String,
  ratingCount: String,
  ratingValue: String,
  released: {
    year: Number,
    month: Number,
    day: Number,
  },
  slug: String,
  source: String,
  sourceMetaData: Object,
  stars: [String],
  summary: String,
  trailerUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
