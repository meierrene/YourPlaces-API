const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images/', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

app.use((error, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, err => console.log(err));
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occourred!' });
});

const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB)
  .then(() => app.listen(process.env.PORT))
  .catch(err => console.log(err));
