const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const logger = require('./middleware/logger')
const morgan = require('morgan');
const fileupload = require('express-fileupload')
const colors = require('colors');
const connectDB = require('./config/db');
const errHandler = require('./middleware/error')
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

// file upload
app.use(fileupload())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use(router)

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