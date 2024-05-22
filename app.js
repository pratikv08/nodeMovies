const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Runninng at http://localhost:3000')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
intializeDBAndServer()

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
        select * from movie order by movie_id;
    `
  const format = movie => {
    return {
      movieName: movie.movie_name,
    }
  }
  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray.map(movie => format(movie)))
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `
    select * from movie where movie_id = ${movieId};
  `
  const format = movie => {
    return {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor,
    }
  }
  const movie = await db.get(getMovieQuery)
  console.log(movie)
  response.send(format(movie))
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    insert into movie (director_id, movie_name, lead_actor)
    values (${directorId}, '${movieName}',' ${leadActor}')
  `
  const dbResponse = await db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  console.log(movieId)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
    update movie set 
    director_id =${directorId},
    movie_name ='${movieName}',
    lead_actor ='${leadActor}'
    where movie_id = ${movieId};
  `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    delete from movie where movie_id = ${movieId}
  `
  await db.run(deleteMovieQuery)

  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
        select * from director order by director_id;
    `
  const format = director => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    }
  }
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(directorsArray.map(director => format(director)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  console.log(directorId)
  const getDirectorMoviesQuery = `
    select * from movie where director_id = ${directorId}
  `
  const format = movie => {
    return {
      movieName: movie.movie_name,
    }
  }
  const movies = await db.all(getDirectorMoviesQuery)
  response.send(movies.map(movie => format(movie)))
})

module.exports = app
