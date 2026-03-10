const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(async () => {
  const Booking = require('./server/models/bookingModel');
  const bookings = await Booking.find().populate('tour');
  if (bookings.length > 0) {
    console.log('Bookings array snapshot:');
    bookings.slice(-3).forEach(b => {
       console.log(b.tour ? `Tour: ${b.tour.name}, Img: ${b.tour.imageCover}` : `Tour is null for booking ${b._id}`);
    });
  } else {
    console.log('No bookings found.');
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
