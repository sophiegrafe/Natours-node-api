/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prefer-object-spread */
const Tour = require('../models/tourModel');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach(
      (field) => delete queryObj[field]
    );

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(
      JSON.parse(queryStr)
    );

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(
        '-createdAt name'
      );
    }

    return this;
  }

  project() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 1;
    const skip = (page - 1) * limit;

    this.query = this.query
      .skip(skip)
      .limit(limit);

    return this;
  }
}

//route handlers
module.exports = {
  async getAllTours(req, res) {
    try {
      // Execute the query
      const features = new APIFeatures(
        Tour.find(),
        req.query
      )
        .filter()
        .sort()
        .project()
        .paginate();

      const tours = await features.query;

      // Send the response
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours: tours,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err.message,
      });
    }
  },
  async getOneTour(req, res) {
    try {
      const tour = await Tour.findById(
        req.params.id
      );
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  },
  async createTour(req, res) {
    try {
      // create a new tour creating a new document then saving it
      /*const newTour = new Tour({});
      newTour.save();*/

      // create a new tour calling the create method directly on the model itself
      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail ',
        message: err,
      });
    }
  },
  async updateTour(req, res) {
    try {
      const tour = await Tour.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  },
  async deleteTour(req, res) {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      // statut 204 : no content
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  },
  aliasTop5Tours(req, res, next) {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields =
      'name,price,ratingsAverage,summary,difficulty';
    next();
  },
};
