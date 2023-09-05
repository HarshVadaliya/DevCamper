const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const { parse } = require('dotenv');
const { findById } = require('../models/Bootcamp');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');

// @desc Get all Courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	if(req.params.bootcampId){
		const courses = await Course.find({ bootcamp: req.params.bootcampId })
		
		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses
		});
	} else{
		res.status(200).json(res.advancedResults);
	}
});

// @desc Get a specific Course using an id
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	// let query;
	const course = await Course.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description"
	});

	if(!course){
		return next(new ErrorResponse(`No course found with the id of ${req.params.id}`, 404))
	}

	res.status(200).json({
		success: true,
		data: course
	})
});

// @desc Add a Course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if(!bootcamp){
		return next(new ErrorResponse(`No bootcamp found with the id of ${req.params.bootcampId}`, 404));
	}

	//Make sure that the user is bootcamp owner
	if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(`User ${req.user.name} is not authorized to add a course to bootcamp ${bootcamp.name}.`, 401)
		);	
	} 
	
	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course
	})
});

// @desc Update a Course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);
	
	if(!course){
		return next(new ErrorResponse(`No course found with the id of ${req.params.bootcampId}`, 404))
	}

	//Make sure that the user is course owner
	if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(`User ${req.user.name} is not authorized to update course ${course.title}.`, 401)
		);	
	} 

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	})

	res.status(200).json({
		success: true,
		data: course
	})
});

// @desc Get a course using id
// @route /api/v1/courses/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
		const bootcamp = await Bootcamp.findById(req.params.id)

		if(!bootcamp){
			return next(
				new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
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

// @desc delete a course using id
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
		const id = req.params.id;
		let course = await Course.findById(id);
		
		if(!course){
			return next(
				new ErrorResponse(`Course not found with id of ${id}`, 404)
			)
		}
		
		//Make sure that the user is course owner
		if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
			return next(
				new ErrorResponse(`User ${req.user.name} is not authorized to delete course ${course.title}.`, 401)
			);	
		} 
		
		course = await Course.findByIdAndDelete(id);

		res.status(200).json({success : true, data: {} });
});