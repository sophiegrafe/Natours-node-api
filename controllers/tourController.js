/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prefer-object-spread */
const Tour = require('../models/tourModel');

//route handlers
module.exports = {
  async getAllTours(req, res) {
    try {
      // Build the query
      // 1. Filtering
      const {
        page,
        sort,
        limit,
        fields,
        ...queryObj
      } = { ...req.query };

      // 2. Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      const query = Tour.find(
        JSON.parse(queryStr)
      );

      console.log(JSON.parse(queryStr));
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
