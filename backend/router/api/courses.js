const router = require('express').Router({ mergeParams: true });
const { getCourses } = require('../../controllers/courses');


	// All course routes
	router
		.route('/')
		.get(getCourses)

	// router
	// 	.route('/:id')
	// 	.get(getBootcamp)
	// 	.put(updateBootcamp)
	// 	.delete(deleteBootcamp);
	
	// router
	// 	.route('/login')
	// 	.get()
	// 	.post()
module.exports = router;