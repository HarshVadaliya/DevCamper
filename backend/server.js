const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const sanitizer = require("perfect-express-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const logger = require('./middleware/logger');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const colors = require('colors');
const connectDB = require('./config/db');
const errHandler = require('./middleware/error');
//Load env vars 
dotenv.config({ path: './config/config.env'});

//Connect to database
connectDB();

//Route files
const router = require('./router');

const app = express();

// request BodyParser

app.use(express.json());

// app.use(cookieParser);
// app.use(logger);

//Dev logging middleware

if(process.env.NODE_ENV	=== 'development') {
	app.use(morgan('dev'));
}

// File upload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(sanitizer.clean({
    xss: true,
    noSql: true,
    sql: false,
  }));

// Rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use(router);

// Custom err handler middleware
app.use(errHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.bgGreen.white.bold));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`);
	//Close server & exit process
	server.close(() => process.exit(1));
});