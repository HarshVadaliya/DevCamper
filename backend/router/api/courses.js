const router = require('express').Router({ mergeParams: true });
const { 
		getCourses, 
		getCourse, 
		addCourse, 
		updateCourse, 
		deleteCourse 
	} = require('../../controllers/courses');

const Course = require('../../models/Course');
const advancedResults = require('../../middleware/advancedResults');

	// All course routes
	router
		.route('/')
		.get(
			advancedResults(Course, {
				path: 'bootcamp',
				select: 'name description'
			}),
		 getCourses)
		.post(addCourse)
	
	router
		.route('/:id')
		.get(getCourse)
		.put(updateCourse)
		.delete(deleteCourse)


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