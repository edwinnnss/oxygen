const mongoose = require('mongoose');

const { Schema } = mongoose;

const MovieSchema = new Schema({
  coverImageUrl: String,
  duration: String,
  language: String,
  name: String,
  released: String,
  slug: String,
  source: String,
  summary: String,
  trailerUrl: String,
  quality: String,
  directors: [String],
  downloadLinks: [String],
  embedLinks: [String],
  genres: [String],
  stars: [String],
  tags: [String],
}, { timestamps: true });

MovieSchema.indexes({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Movie', MovieSchema);
