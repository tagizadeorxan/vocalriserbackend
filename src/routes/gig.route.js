const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gig.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createGigSchema,updateGigSchema } = require('../middleware/validators/gigValidator.middleware');



//Gigs
router.get('/getGigs/:type/:gender', auth(), awaitHandlerFactory(gigController.getAllGigs)); 
router.get('/getGig/:id', auth(), awaitHandlerFactory(gigController.getGigByID)); 
router.get('/getGigbyUserID/:id', auth(), awaitHandlerFactory(gigController.getGigbyUserID)); 
router.post('/createGig', auth(), createGigSchema, awaitHandlerFactory(gigController.createGig)); 

module.exports = router;