const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(
  async (req, res, next) => {
    const users = await User.find();

    // Send the response
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

exports.getOneTour = catchAsync(
  async (req, res, next) => {}
);
exports.createUser = catchAsync(
  async (req, res, next) => {}
);
exports.updateUser = catchAsync(
  async (req, res, next) => {}
);
exports.deleteUser = catchAsync(
  async (req, res, next) => {}
);
