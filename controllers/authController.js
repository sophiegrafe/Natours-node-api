const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const generateToken = (id) =>
  jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

exports.signup = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt:
        req.body.passwordChangedAt,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

exports.login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new AppError(
          'Please provide email and password!',
          400
        )
      );
    }

    const user = await User.findOne({
      email,
    }).select('+password');

    if (
      !user ||
      !(await user.checkPassword(
        user.password,
        password
      ))
    ) {
      return next(
        new AppError(
          'Incorrect email or password',
          401
        )
      );
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

exports.protect = catchAsync(
  async (req, res, next) => {
    // 1. Check if token in headers
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        'Bearer'
      )
    ) {
      token =
        req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError(
          'You are not logged in!',
          401
        )
      );
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3. Still existing user
    const currentUser = await User.findById(
      decoded.id
    );
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // 4. Password unchanged after token was issued
    if (
      currentUser.changedPasswordAfter(
        decoded.iat
      )
    ) {
      return next(
        new AppError(
          'Password was changed recently! Please lod in again.',
          401
        )
      );
    }
    // Grant access to protected route
    req.user = currentUser;
    next();
  }
);
