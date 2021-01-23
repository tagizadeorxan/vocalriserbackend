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
router.get('/getBidsByGigID/:id', auth(), awaitHandlerFactory(gigController.getBidsByGigID)); 
router.delete('/removeBid/:id', auth(), awaitHandlerFactory(gigController.deleteBid)); 
router.post('/submitBid', auth(), awaitHandlerFactory(gigController.submitBid));
router.post('/closeGigByID/:id', auth(), awaitHandlerFactory(gigController.closeGigByID));
router.post('/awardGigByID/:id', auth(), awaitHandlerFactory(gigController.awardGigByID));
router.get('/bidExist/:id', auth(), awaitHandlerFactory(gigController.getBidExist)); 
router.get('/cards', awaitHandlerFactory(gigController.getCards)); 
router.get('/languages', awaitHandlerFactory(gigController.getLanguages)); 
router.get('/genres', awaitHandlerFactory(gigController.getGenres)); 
router.post('/acceptContractGigByID/:id', auth(), awaitHandlerFactory(gigController.acceptGigByID));
router.post('/completeGigByID/:id', auth(), awaitHandlerFactory(gigController.completeGigByID));
router.get('/getGigsByUserID/:id', auth(), awaitHandlerFactory(gigController.getCreatorGigsByUserID));
router.get('/getBidderSuccessfullGigsByUserID/:id', auth(), awaitHandlerFactory(gigController.getBidderSuccessfullGigsByUserID));  
router.get('/prepareContractForGig/:id', auth(), awaitHandlerFactory(gigController.prepareContractForGig));  

router.post('/sendContract', auth(), awaitHandlerFactory(gigController.sendContract));  

module.exports = router;