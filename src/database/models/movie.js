const mongoose = require('mongoose');

const { Schema } = mongoose;

const MovieSchema = new Schema({
  countries: [{
    label: String,
    slug: String,
  }],
  type: String,
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
  episodes: Object, // { index: Number, episode: Number, title: String, sourceMetaData: Object }
}, { timestamps: true });

MovieSchema.index({ 'slug': 1 });
MovieSchema.index({ 'name': 1 });
MovieSchema.index({ 'released.year': 1, 'released.month': 1, 'released.day': 1 });

module.exports = mongoose.model('Movie', MovieSchema);
