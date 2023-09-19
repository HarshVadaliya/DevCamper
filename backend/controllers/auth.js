const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')

// @desc Register a user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const  { name, email, password, role } = req.body;

    // Create a user
    const user = await User.create({
        name,
        email,
        password,
        role
    })

    // Create token
    const token = user.getSignedJwtToken();
    
	res.status(200).json({success: true, token});
});


// @desc login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const  { email, password } = req.body;

    // Validate email & password
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        return next(new ErrorResponse('Invalid credentials.', 401));
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials.', 401));
    }

    sendTokenresponse(user, 200, res);
});

// @desc Log user out / Clear Cookie
// @route GET /api/v1/auth/logout
// @access Private

exports.logout = asyncHandler(async (req,res,next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private

exports.getMe = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc Update user details
// @route PUT /api/v1/auth/userdetails
// @access Private

exports.updateDetails = asyncHandler(async (req,res,next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });


    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private

exports.updatePassword = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenresponse(user, 200, res);
});

// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public

exports.forgotPassword = asyncHandler(async (req,res,next) => {
    const user = await User.findOne({ email : req.body.email });
    console.log('user: ',user);
    if(!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    console.log('resetToken ',resetToken);

    await user.save({validateBeforeSave: false});

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a request to this password reset link: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Password reset token`,
            message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpired = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc Reset password for user
// @route POST /api/v1/auth/resetpassword:resettoken
// @access Private

exports.resetPassword = asyncHandler(async (req,res,next) => {

    //Get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpired: { $gt: Date.now() }
    })

    if(!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    //set the new password

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;
    await user.save();
    sendTokenresponse(user, 200, res);

    res.status(200).json({
        success: true,
        data: user
    });
});

// Get token from model, cookie and send response
const sendTokenresponse = async (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 8 * 3600 * 1000),
        httpOnly: true
    };

    // if(process.env.NODE_ENV === 'production') {
    //     options.secure = true;
    // }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
                success: true,
                token
            });
};