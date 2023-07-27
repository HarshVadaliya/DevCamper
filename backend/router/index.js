const router = require('express').Router();
const bootcampRouter = require('./api/bootcamps');
const courseRouter = require('./api/courses');
const authRouter = require('./api/auth');

router.use('/api/v1/bootcamps', bootcampRouter);
router.use('/api/v1/courses', courseRouter);
router.use('/api/v1/auth', authRouter);

module.exports = router;