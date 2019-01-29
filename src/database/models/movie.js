const mongoose = require('mongoose');

const { Schema } = mongoose;

const MovieSchema = new Schema({
  countries: [{
    label: String,
    slug: String,
  }],
  coverImageUrl: String,
  directors: [{
    label: String,
    slug: String,
  }],
  duration: String,
  genres: [{
    label: String,
    slug: String,
  }],
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
  stars: [{
    label: String,
    slug: String,
  }],
  summary: String,
  trailerUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
