const path = require('path');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  //handles synchronous exceptions globally
  console.log(err.name, err.message, err.stack);
  console.log('UNHANDLED Exception\nCLOSING ALL RESOURCES!!!!!!!!!!');
  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../config.env') });
// console.log(process.env);
const app = require('./app');

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Successful');
  });

// const testTour = new Tour({
//   name: 'The Park Fiddler',
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR OMG🐟🐟', err);
//   }); //saved it in the db

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}... `);
});

process.on('unhandledRejection', (err) => {
  //handles unhandled promise rejections globally
  console.log(err.name, err.message, err.stack);
  console.log('UNHANDLED PROMISE REJECTION\nCLOSING ALL RESOURCES!!!!!!!!!!');
  server.close(() => {
    process.exit(1);
  });
});
