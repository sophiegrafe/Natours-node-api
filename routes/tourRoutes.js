const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

//param middelware function
//router.param('id', tourController.checkID);

//routes
router
  .route('/top-5-tours')
  .get(
    tourController.aliasTop5Tours,
    tourController.getAllTours
  );
router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(
    authController.protect,
    tourController.getAllTours
  )
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
