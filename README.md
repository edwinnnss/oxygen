### 1. get movie list
##### end point: /movie
##### query string:
- director
- genres
- page
- sortBy
- sortDirection
- star
- years
##### return
```
[{
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
}]
```

### 2. get movie
##### end point: /movie/:slug
##### query string:
##### return
```
{
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
}
```

### 2. get source meta data
##### end point: /movie/:slug/play
##### query string:
##### return
```
{
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
}
```