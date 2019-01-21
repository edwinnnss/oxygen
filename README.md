### 1. get movie list
##### end point: /movie
##### query string:
- page: String
##### return
```
[{
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
}]
```

### 2. get movie
##### end point: /movie/:slug
##### query string:
##### return
```
{
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
}
```