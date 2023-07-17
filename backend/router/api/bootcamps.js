const router = require('express').Router();
const { getBootcamps,getBootcamp,createBootcamp,updateBootcamp,deleteBootcamp, getBootcampsInRadius } = require('../../controllers/bootcamps');
	// Other resource routers
	const courseRouter = require('./courses') 

	// Reroute into other resource routers
	router.use('/:bootcampId/courses', courseRouter)
	

	router
		.route('/radius/:zipcode/:distance')
		.get(getBootcampsInRadius)

	router
		.route('/')
		.get(getBootcamps)
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