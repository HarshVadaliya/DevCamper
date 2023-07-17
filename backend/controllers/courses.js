const Course = require('../models/Course');
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const { parse } = require('dotenv');
// @desc Get all Courses
// @route /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;
	if(req.params.bootcampId){
		query = Course.find({bootcamp: req.params.bootcampId})
	} else{
		query = Course.find().populate({
			path: 'bootcamp',
			select: 'name description'
		});
	}

	const courses = await query;

	res.status(200).json({
		success: true,
		count: courses.length,
		data: courses
	})
})
// exports.getCourses = asyncHandler(async (req, res, next) => {
//     let query;
//     if(req.params.bootcampId) {
//         query = Course.find({bootcamp: req.params.bootcampId})
//     } else{
//         query = Course.find();
//     }
//     const courses = await query;

//     res.status(200).json({
//         success: true,
//         count: courses.length,
//         data: courses
//     })
// })
// @desc Get a course using id
// @route /api/v1/courses/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
		const bootcamp = await Bootcamp.findById(req.params.id)

		if(!bootcamp){
			return next(
				new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
			)
		}

		res.status(200).json({
			success : true, 
			data: bootcamp
		});
});
// @desc Create a course using id
// @route /api/v1/courses/
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({
			success : true, 
			data: bootcamp
		});	
});
// @desc Update a course using id
// @route /api/v1/courses/:id	
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
		const id  = req.params.id;
		const data = req.body;
		const bootcamp = await Bootcamp.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true
		});

		if(!bootcamp){
			return next(
				new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
			)
		}

		res.status(200).json({
			success : true, 
			data: bootcamp
		});
});
// // @desc Get bootcamps within a radius
// // @route /api/v1/bootcamps/radius/:zipcode/:distance
// // @access Private
// exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
// 	const { zipcode, distance } = req.params

// 	// Get lat/lng from geocoder
// 	const loc = await geocoder.geocode(zipcode) 
// 	const lat = loc[0].latitude;
// 	const lng = loc[0].longitude;
// 	//Calc radius using radians
// 	//Divide dist by radius of Earth
// 	//Earth Radius = 3963 miles / 6378
// 	const radius = distance / 3963;

// 	const bootcamps = await Bootcamp.find({
// 		location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
// 	})
// 	res.status(200).json({
// 		success: true,
// 		count:  bootcamps.length,
// 		data: bootcamps
// 	})
// });
// @desc delete a course using id
// @route /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
		const id = req.params.id;
		const data = req.body;
		const course = await Course.findByIdAndDelete(id);
		
		if(!course){
			return res.status(400).json({ success: false })
		}

		res.status(200).json({success : true, data: {} });
});