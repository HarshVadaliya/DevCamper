const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder');
const { parse } = require('dotenv');

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});
// @desc Get a bootcamp using id
// @route /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id).populate('courses')

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
// @desc Create a bootcamp using id
// @route /api/v1/bootcamps/
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success : true, 
		data: bootcamp
	});	
});
// @desc Update a bootcamp using id
// @route /api/v1/bootcamps/:id	
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
// @desc Get bootcamps within a radius
// @route /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode) 
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;
	//Calc radius using radians
	//Divide dist by radius of Earth
	//Earth Radius = 3963 miles / 6378
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
	})
	res.status(200).json({
		success: true,
		count:  bootcamps.length,
		data: bootcamps
	})
});
// @desc delete a bootcamp using id
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const data = req.body;
	const bootcamp = await Bootcamp.findById(id);
	
	if(!bootcamp){
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		)
	}

	await bootcamp.deleteOne()
	await Course.deleteMany( { bootcamp: bootcamp._id });

	res.status(200).json({success : true, data: {} });
});

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const bootcamp = await Bootcamp.findById(id);
	
	if(!bootcamp){
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		)
	}
	if(!req.files){
		return next(new ErrorResponse(`Please upload a file`, 400));
	}
	
	const file =  req.files.file;
	if (!file.mimetype.startsWith('image')){
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	if(file.size > process.env.MAX_FILE_UPLOAD){
		return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
	}

	// Create custom file name
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
		if(err){
			console.log('err in photo upload: ',err);
			return ErrorResponse(`Problem with file upload`, 500);
		}
		await Bootcamp.findByIdAndUpdate( req.params.id, {photo: file.name} );

		res.status(200).json({
			success: true,
			data: file.name
		});
	});

	// res.status(200).json({success : true, data: {} });
});