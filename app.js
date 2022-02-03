const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');

//start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1)GLOBAL  MIDDLEWARES --- EVERYTHING IN THIS FILE IS MIDDLEWARE... after moving things to seperate folders.

//serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//  SET SECURITY HTTP HEADERS // also a middleware..
app.use(helmet());

//limit requets for api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter); // will work on all places that start with

app.use(helmet());

//body parser. reading data from body into req.body // reads data into request.body

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitazation against noSQL query injection
app.use(mongoSanitize());

//data sanitazation against XXS

app.use(xss());

//Prevent parameter polluton (last to clean query string) // mean u use double sort. like ?sort=duration ?sort= price. Wont work unless u have this. hpp

app.use(
  hpp({
    whitelist: [
      //exceptions
      'duration',
      'rating',
      'maxGroupSize',
      'ratingsQuantity',
      'difficulty',
      'price'
    ]
  })
);

//serving static files
// app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from middleware ');
//   next();
// });

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);

  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
//SIMPLIFY TOP CODE INTO BELOW CODE. BETTER ----> app.route()  -----> into below code

// 3) ROUTES(mounting)
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//all http methods
// THIS IS AT THE BOTTOM OF MIDDLE-WARE STACK. BECAUSE IF IT DOESNT DO THE ABOVE CODE IT WILL DEFAULT AND RUN THIS PEICE
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cant find ${req.originalUrl} on this server!`
  // });
  // const err = new Error(`Cant find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = '404';
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 3) START SERVER
module.exports = app;
