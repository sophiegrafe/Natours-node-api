/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prefer-object-spread */
const Tour = require('../models/tourModel');

//route handlers
module.exports = {
  async getAllTours(req, res) {
    try {
      // Build the query
      // 1a. Filtering
      const {
        page,
        sort,
        limit,
        fields,
        ...queryObj
      } = req.query;

      // 1b. Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      let query = Tour.find(JSON.parse(queryStr));

      // 2. Sorting the data
      if (sort) {
        const sortBy = sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt name');
      }

      // 3. Limiting the field
      if (fields) {
        const selectedFields = fields
          .split(',')
          .join(' ');
        query = query.select(selectedFields);
      }

      // 4. Pagination
      const pageNum = +page || 1;
      const limitNum = +limit || 1;
      const skip = (pageNum - 1) * limitNum;

      query = query.skip(skip).limit(limitNum);
      if (page) {
        const numTours =
          await Tour.countDocuments();
        if (skip >= numTours)
          throw new Error(
            'There is no result left for this page'
          );
      }

      // Execute the query
      const tours = await query;

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
        message: err,
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
};
