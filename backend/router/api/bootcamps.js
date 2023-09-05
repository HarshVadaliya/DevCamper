const router = require('express').Router();
const { 
	getBootcamps,
			getBootcamp,
			createBootcamp,
			updateBootcamp,
			deleteBootcamp, 
			getBootcampsInRadius, 
			bootcampPhotoUpload 
		} = require('../../controllers/bootcamps');
		
	
const Bootcamp = require('../../models/Bootcamp');

const { protect, authorize } = require('../../middleware/auth');
const advancedResults = require('../../middleware/advancedResults');

// Other resource routers
const courseRouter = require('./courses') 

	// Reroute into other resource routers
	router.use('/:bootcampId/courses', courseRouter)
	

	router
		.route('/radius/:zipcode/:distance')
		.get(getBootcampsInRadius)

	router
		.route('/:id/photo')
		.put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)
	
	router
		.route('/')
		.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
		.post(protect, authorize('publisher', 'admin'), createBootcamp);

	router
		.route('/:id')
		.get(getBootcamp)
		.put(protect, authorize('publisher', 'admin'), updateBootcamp)
		.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
	
	router
		.route('/login')
		.get()
		.post()

module.exports = router;