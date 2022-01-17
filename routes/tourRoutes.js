const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

//param middelware function
//router.param('id', tourController.checkID);

//routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
