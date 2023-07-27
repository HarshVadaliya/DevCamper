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
	const adavancedResults = require('../../middleware/advancedResults');

	// Other resource routers
	const courseRouter = require('./courses') 

	// Reroute into other resource routers
	router.use('/:bootcampId/courses', courseRouter)
	

	router
		.route('/radius/:zipcode/:distance')
		.get(getBootcampsInRadius)

	router
		.route('/:id/photo')
		.put(bootcampPhotoUpload)
	
	router
		.route('/')
		.get(adavancedResults(Bootcamp, 'courses'), getBootcamps)
		.post(createBootcamp);

	router
		.route('/:id')
		.get(getBootcamp)
		.put(updateBootcamp)
		.delete(deleteBootcamp);
	
	router
		.route('/login')
		.get()
		.post()

module.exports = router;