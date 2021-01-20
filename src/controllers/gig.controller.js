const GigModel = require('../models/gig.model');
const BidModel = require('../models/bid.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Utils = require('../utils/helpers.utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/******************************************************************************
 *                              Gig Controller
 ******************************************************************************/
class GigController {

    createGig = async (req, res, next) => {

        this.checkValidation(req);

        const result = await GigModel.create(req.body);

        if (!result) {
            throw new HttpException(500, 'Something went wrong');
        }

        res.status(201).send('Gig was created!');
    };


    getAllGigs = async (req, res, next) => {
        let gigList;

        if (req.params.type === Utils.Both) {
            gigList = await GigModel.find({ active: 1, gender: req.params.gender });
        } else {
            gigList = await GigModel.find({ active: 1, type: req.params.type, gender: req.params.gender });
        }

        if (!gigList.length) {
            throw new HttpException(404, 'Gig not found');
        }

        gigList = gigList.map(gig => {
            // const { password, ...userWithoutPassword } = gig;
            return gig;
        });

        res.send(gigList);
    };

    getGigByID = async (req, res, next) => {
        const gig = await GigModel.findOne({ id: req.params.id });
        if (!gig) {
            throw new HttpException(404, 'Gig not found');
        }

        // const { password, ...userWithoutPassword } = gig;

        res.send(gig);
    };

    getGigbyUserID = async (req, res, next) => {
        const gig = await GigModel.findOne({ user_id: req.params.id, active: 1 });
        if (!gig) {
            throw new HttpException(404, 'Gig not found');
        }

        // const { password, ...userWithoutPassword } = gig;

        res.send(gig);
    };



    getBidsByGigID = async (req, res, next) => {
        const bids = await BidModel.find({ gig_id: req.params.id });
        if (!bids.length) {
            throw new HttpException(404, 'Bid not found');
        }

        res.send(bids);
    };

    
    getBidExist = async (req, res, next) => {
        const bid = await BidModel.find({ user_id: req.params.id });
        if (!bid.length) {
            throw new HttpException(404, 'Bid not found');
        }

        res.send(bid);
    };



    closeGigByID = async (req, res, next) => {

        const result = await GigModel.update({ active: 0 }, req.params.id);
        if (!result) {
            throw new HttpException(404, 'Problem while updating');
        }
        console.log(result)

        res.send(result);
    };



    awardGigByID = async (req, res, next) => {

        let update = {
            active: 2,
            awardedUser: 66
        }


        const result = await GigModel.multipleUpdate(update, req.params.id);
        if (!result) {
            throw new HttpException(404, 'Problem while updating');
        }

        console.log(result)

        res.send(result);
    };


    deleteBid = async (req, res, next) => {

        const result = await BidModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, 'Bid not found');
        }
        res.send('Bid has been deleted');
    };



    submitBid = async (req, res, next) => {
        console.log("okdir")
        const result = await BidModel.create(req.body);
        if (!result) {
            throw new HttpException(404, 'Error while creating');
        }
        res.send('Successfully added');
    };

    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new HttpException(400, 'Validation faild', errors);
        }
    }

    // hash password if it exists
    hashPassword = async (req) => {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 8);
        }
    }
}



/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new GigController;