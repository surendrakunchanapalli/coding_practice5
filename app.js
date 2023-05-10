const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    `DB Error: ${e.message}`;
  }
};
initializeDbAndServer();

const convertMovieNameToPascalCase = (dbObject) => {
  return { movieName: dbObject.movie_name };
};

//1 all movie names API
app.get("/movies/", async (request, response) => {
  const getAllMoviQuery = `SELECT movie_name FROM movie;`;
  const movieArray = await db.all(getAllMoviQuery);
  response.send(
    movieArray.map((movieName) => convertMovieNameToPascalCase(movieName))
  );
});

//2 create new movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}' );`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// to convart PascalCase
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//3 movieID API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//4 movie details update API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE 
       movie 
  SET
         director_id = ${directorId} , 
         movie_name = '${movieName}' , 
         lead_actor = '${leadActor}' 
   WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectorDetailsPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//6 directors list API
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director;`;
  const movieArray = await db.all(getAllDirectorsQuery);
  response.send(
    movieArray.map((each) => convertDirectorDetailsPascalCase(each))
  );
});

const movieNameConvertPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//7 list of all movie names API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsMovieQuery = `SELECT movie_name FROM director INNER JOIN movie ON director.director_id = movie.director_id WHERE director.director_id = ${directorId};`;
  const movie = await db.all(getDirectorsMovieQuery);
  console.log(directorId);
  response.send(movie.map((each) => movieNameConvertPascalCase(each)));
});
module.exports = app;
