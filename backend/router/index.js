const router = require('express').Router();
const bootcampRouter = require('./api/bootcamps');
const courseRouter = require('./api/courses');

router.use('/api/v1/bootcamps', bootcampRouter);
router.use('/api/v1/courses', courseRouter);
module.exports = router;

