const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Enable CORS to allow React frontend on Vercel to call API with credentials
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../public'))); 

// If a production build of the React UI exists, serve it at root (SPA) while keeping API routes intact
app.use(express.static(path.join(__dirname, '../client', 'dist')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //gives info about the request being made
}

const limiter = rateLimit({
  // Increase limit for development/testing
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

// app.use('/api', limiter); 
app.use(helmet()); //security http headers
app.use(mongoSanitize()); //gets rid of all dollar signs and . in mongo so now email: {$gt: ""} cannot be used to do a nosql injection attack [this basically returned all items and gave admin privilege]

app.use(
  express.json({
    limit: '10mb',
  }),
); //middleware [reading data from body into req.body, max size is 10mb]
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); //Prevents parameter pollution [&sort=price&sort=duration, this would throw an error since we cannot split an array (only strings), but using hpp it ignores polluted parameters and only sorts using the last one [duration]]

//MIDDLEWARES

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

//set security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:', 'http:', '*'],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://unpkg.com',
        'https://tile.openstreetmap.org',
        'https://fonts.googleapis.com/',
      ],
      connectSrc: [
        "'self'",
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com',
        'https://tile.openstreetmap.org',
        'https://*.tile.openstreetmap.org',
        'https://api-preprod.phonepe.com',
        'https://api.phonepe.com',
        'ws:',
      ],
      frameSrc: [
        "'self'",
        'https://api-preprod.phonepe.com',
        'https://api.phonepe.com',
        'https://merch-preprod.phonepe.com',
      ],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:', '*'],
      fontSrc: [
        "'self'",
        'https:',
        'data:',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
      ],
    },
  }),
);

//route handlers

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//works the same as above code but its simpler to write/better for routing a single url to different

//routes

// Keep legacy Pug views available under /pug 
app.use('/pug', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//if any valid req was made, it would have been handled by above 2 routers. All other requests reach here

// Serve React SPA for all frontend routes (does not apply to /api routes)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
});

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

//server
