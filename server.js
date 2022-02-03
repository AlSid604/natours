const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

//CATCHING REFERENCE ERROR
process.on('uncaughtException', err => {
  console.log(`💥Error💥: ${err.name} : ${err.message}`);
  console.log('UNCAUGHT EXCEPTION! Shutting down!');
  server.close(() => {
    process.exit(1);
  });
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//CATCHING REJECTED PROMISES
process.on('unhandledRejection', err => {
  const fullMessage = err.message;
  const errmsgStart = 0; // Start at the beginnniçng
  const newline = /\n/; // new line character
  const errmsgStop = fullMessage.search(newline); // Find new line
  const errmsgLen = errmsgStop - errmsgStart;
  const errorText = fullMessage.substr(errmsgStart, errmsgLen);
  console.log(`💥Error Name💥: ${err.name}`);
  console.log(`💥💥Error Text: ${errorText}`);
  console.log('UNHANDLED REJECTION! Shutting down!');
  server.close(() => {
    process.exit(1);
  });
});
