const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //rendering page

  //1) Get tour data from collection
  const tours = await Tour.find();

  //2) Build template (not here)

  //3)Render that template using tour data from 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours //same as just writing tours once.
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'reviews',
      fields: 'review rating user'
    })
    .populate('guides', ['name', 'guide', 'email', 'role', 'photo']);

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('sign-up', {
    title: 'Sign up!'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.paymentSuccess = (req, res) => {
  res.status(200).render('paymentsuccess', {
    title: 'Payment success'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings

  const bookings = await Booking.find({ user: req.user.id });
  //2) Find tours with the returned IDS

  const tourIDs = bookings.map(el => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

// exports.getMyReviews = catchAsync(async (req, res, next) => {
//   console.log(req);
//   // 1) find all reviews
//   const reviews = await Review.find({ user: req.user._id });

//   const reviewIDs = allReviews.map(el => el.data);
//   const allReviews = await Review.find({ _id: { $in: reviewIDs } });

//   // const reviewIDs = bookings.map(el => console.log(el));
//   // const reviews = await Review.find({ _id: { $in: reviewIDs } });

//   //2)
//   res.status(200).render('overview', {
//     title: 'My Reviews',
//     allReviews
//   });
// });

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
