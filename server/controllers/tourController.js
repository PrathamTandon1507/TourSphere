const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
//no longer using this since we will be using for db and not json file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: '404',
//       message: 'Invalid ID',
//     }); //imp to return to ensure it doesnt move to next middleware since its an error
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: '400',
//       message: 'No price or name ',
//     });
//   }
//   next();
// }; //cannot use val as parameter here, only allowed when using middleware function with router.param('id',function)

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image', 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

exports.parseTourData = (req, res, next) => {
  const cleanAndParse = (val) => {
    if (typeof val !== 'string') return val;
    try {
      // 1. Strip literal single/double quotes at Start/End if they exist
      const cleaned = val.replace(/^['"]|['"]$/g, '').trim();
      // 2. Parse the cleaned string
      const parsed = JSON.parse(cleaned);
      // 3. If still a string after one parse (double-stringified), parse again
      if (typeof parsed === 'string') {
        return JSON.parse(parsed.replace(/^['"]|['"]$/g, '').trim());
      }
      return parsed;
    } catch (err) {
      return val;
    }
  };

  ['startLocation', 'locations', 'startDates'].forEach((key) => {
    if (req.body[key]) {
      req.body[key] = cleanAndParse(req.body[key]);
      
      // Explicitly ensure GeoJSON 'type: Point' for Mongoose and Map compatibility
      if (key === 'startLocation' && req.body[key] && typeof req.body[key] === 'object') {
        req.body[key].type = 'Point';
      }
      if (key === 'locations' && Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(loc => ({
          ...loc,
          type: 'Point'
        }));
      }
    }
  });
  next();
};

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) return next();

  // Ensure directories exist
  const tourPath = path.join(__dirname, '..', '..', 'public', 'img', 'tours');
  if (!fs.existsSync(tourPath)) {
    fs.mkdirSync(tourPath, { recursive: true });
  }

  // Use ID if available, otherwise use a combination of tour name and timestamp
  const identifier = req.params.id || `${req.body.name?.toLowerCase().split(' ').join('-') || 'new-tour'}-${Date.now()}`;

  // 1. cover image
  if (req.files.imageCover) {
    const imageCoverFilename = `tour-${identifier}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(tourPath, imageCoverFilename));

    req.body.imageCover = imageCoverFilename;
  }

  // 2. images []
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${identifier}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(path.join(tourPath, filename));

        req.body.images.push(filename);
      }),
    );
  }

  next();
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.getTourBySlug = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user photo',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doc: tour,
    },
  });
});

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }, //filters ratings >= 4.5
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //group based on difficulty or any param of your choice
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    //   {
    //     $match: { _id: { $ne: 'EASY' } }, //to only view data that is not easy [excluding data]
    //   },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //Breaks startDates array into separate documents
    },
    {
      $match: {
        //only display dates in the same calander year
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //Group by month
        numTourStarts: { $sum: 1 }, //count how many tours start in each
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, //Renames _id to month
    },
    {
      $project: {
        _id: 0, //Removes _id field
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      }, //to get rid of all other fields
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
