//FOR STRIPE TO WORK. YOU NEED THE FRONTEND AND THE BACKEND PARTS/. <----- THIS IS THE BACKEND PART.   THE FRONT IS IN PUBLIC/JS
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // this one only works for backend
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2) Create checkout session and send to client
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'cad',
        quantity: 1
      }
    ]
  });

  //3) create session as response

  res.status(200).json({
    status: 'success',
    session
  });
});

//view route.

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only temporary because its unsecure: everyone can make bookings without paying
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  // res.redirect(`${req.originalUrl.split('?')[0]}`);
  req.originalUrl = req.originalUrl.split('?')[0];
  console.log(req.originalUrl);
  res.redirect(`${req.protocol}://${req.get('host')}/payment-success`);

  //getting rid of the price user and tour so that other people dont get it after this is done.// this will redirect them to the home page where is will go again through this loop but get stopped at the above code because we removed those so it will be false and return next()
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
