const GigModel = require('../models/gig.model');
const UserModel = require('../models/user.model')
const BidModel = require('../models/bid.model');
const CardModel = require('../models/cards.model')
const languages = require('../utils/languages.utils')
const genres = require('../utils/genres.utils')
const prepareContract = require('../utils/contract.util')
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Utils = require('../utils/helpers.utils');
const { ContractSender } = require('../utils/helpers.utils')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User } = require('../utils/userRoles.utils');
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

    getCreatorGigsByUserID = async (req, res, next) => {
        let giglist;

        giglist = await GigModel.find({ user_id: req.params.id })
        if (!giglist.length) {
            throw new HttpException(404, 'Gig not found');
        }

        res.send(giglist);
    }

    getBidderSuccessfullGigsByUserID = async (req, res, next) => {
        let giglist;

        giglist = await GigModel.find({ awardedUser: req.params.id, active: 2 })
        if (!giglist.length) {
            throw new HttpException(404, 'Gig not found');
        }
        console.log(giglist)
        res.send(giglist);
    }





    getLanguages = async (req, res, next) => {
        res.send(languages)
    }
    getGenres = async (req, res, next) => {
        res.send(genres)
    }

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




    getCards = async (req, res, next) => {
        let cards;

        cards = await CardModel.find();

        if (!cards.length) {
            throw new HttpException(404, 'Gig not found');
        }

        res.send(cards);
    };

    getBidsByGigID = async (req, res, next) => {
        const bids = await BidModel.find({ gig_id: req.params.id });
        if (!bids.length) {
            throw new HttpException(404, 'Bid not found');
        }

        res.send(bids);
    };


    getBidExist = async (req, res, next) => {
        const bid = await BidModel.find({ user_id: req.body.user_id,gig_id:req.body.gig_id });
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
            progress: 0,
            awardedUser: 66
        }


        const result = await GigModel.multipleUpdate(update, req.params.id);
        if (!result) {
            throw new HttpException(404, 'Problem while updating');
        }

        console.log(result)

        res.send(result);
    };

    prepareContractForGig = async (req, res, next) => {
        const gig = await GigModel.findOne({ id: req.params.id });
        if (!gig) {
            throw new HttpException(404, 'Gig not found');
        }

        let contract = prepareContract(gig)
        res.send({
            contract
        })

    }

    sendContract = async (req, res, next) => {

        const doc = new PDFDocument();
        

        doc.pipe(fs.createWriteStream('contract.pdf'));

        // Embed a font, set the font size, and render some text
        doc 
        .font(__dirname+'/Art Brewery.ttf')
            .fontSize(25)
            .text(req.body.contract, 100, 100);

        doc
            .save()

        doc.end()

        let awarder = await UserModel.findOne({ id: req.body.user_id, active: 1 })
        let awarded = await UserModel.findOne({ id: req.body.awardedUser, active: 1 })

        if (!awarder || !awarded) {
            throw new HttpException(404, 'User not found');
        }

        if (awarder && awarded) {
            console.log(awarder.email)
            console.log(awarded.email)
            ContractSender(awarder.email)
            ContractSender(awarded.email)
        }

        res.json({ success: true })
    }


    acceptGigByID = async (req, res, next) => {

        let update = {
            progress: 1
        }

        const result = await GigModel.multipleUpdate(update, req.params.id);
        if (!result) {
            throw new HttpException(404, 'Problem while updating');
        }

        res.send(result);
    };


    completeGigByID = async (req, res, next) => {

        let update = {
            progress: 2
        }

        const result = await GigModel.multipleUpdate(update, req.params.id);
        if (!result) {
            throw new HttpException(404, 'Problem while updating');
        }

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