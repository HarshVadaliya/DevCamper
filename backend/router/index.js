const router = require('express').Router();
const bootcampsRouter = require('./api/bootcamps');
const coursesRouter = require('./api/courses');
const authRouter = require('./api/auth');
const usersRouter = require('./api/users');

router.use('/api/v1/bootcamps', bootcampsRouter);
router.use('/api/v1/courses', coursesRouter);
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', usersRouter);

module.exports = router;