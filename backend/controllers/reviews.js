const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const { parse } = require('dotenv');
const { findById } = require('../models/Bootcamp');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const Review = require('../models/Review');

// @desc Get reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	if(req.params.bootcampId){
		const reviews = await Review.find({ bootcamp: req.params.bootcampId })
		
		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews
		});
	} else{
		res.status(200).json(res.advancedResults);
	}
});
