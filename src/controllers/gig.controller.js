const GigModel = require('../models/gig.model');
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

     if(req.params.type === Utils.Both) {
        gigList = await GigModel.find({active:1,gender:req.params.gender});
     } else {
        gigList = await GigModel.find({active:1,type:req.params.type,gender:req.params.gender});
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
        const gig = await GigModel.findOne({ id: req.params.id,active:1});
        if (!gig) {
            throw new HttpException(404, 'Gig not found');
        }

        // const { password, ...userWithoutPassword } = gig;

        res.send(gig);
    };

    getGigbyUserID = async (req, res, next) => {
        const gig = await GigModel.findOne({ user_id:req.params.id,active:1});
        if (!gig) {
            throw new HttpException(404, 'Gig not found');
        }

        // const { password, ...userWithoutPassword } = gig;

        res.send(gig);
    };


    getUserByuserName = async (req, res, next) => {
        const user = await UserModel.findOne({ username: req.params.username,active:1 });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getCurrentUser = async (req, res, next) => {
      
        const { password, ...userWithoutPassword } = req.currentUser;

        res.send(userWithoutPassword);
    };

    createUser = async (req, res, next) => {
        this.checkValidation(req);

        const email = await UserModel.findOne({email:req.body.email})

        if(email) {
            throw new HttpException(409, 'This email is already registered');
        }

        
        const username = await UserModel.findOne({username:req.body.username})
        if(username) {
            throw new HttpException(409, 'This username already exists');
        }

  
        await this.hashPassword(req);

        const result = await UserModel.create(req.body);

        if (!result) {
            throw new HttpException(500, 'Something went wrong');
        }

        res.status(201).send('User was created!');
    };

    updateUser = async (req, res, next) => {
        this.checkValidation(req);

        await this.hashPassword(req);

        const { confirm_password, ...restOfUpdates } = req.body;

        // do the update query and get the result
        // it can be partial edit
        const result = await UserModel.update(restOfUpdates, req.params.id);

        if (!result) {
            throw new HttpException(404, 'Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        const message = !affectedRows ? 'User not found' :
            affectedRows && changedRows ? 'User updated successfully' : 'Updated faild';

        res.send({ message, info });
    };

    deleteUser = async (req, res, next) => {
       const update = {
           active:0
       }
        const result = await UserModel.update(update,req.params.id);
        if (!result) {
            throw new HttpException(404, 'User not found');
        }
        res.send('User has been deleted');
    };



    lockUser = async (req, res, next) => {
        const update = {
            active:2
        }
 
         const result = await UserModel.update(update,req.params.id);
         if (!result) {
             throw new HttpException(404, 'User not found');
         }
         res.send('User has been locked');
     };

    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        let { email, password: pass } = req.body;
   
        const user = await UserModel.findOne({ email });
        
       

        if (!user) {
            throw new HttpException(401, 'Unable to login!');
        }
     
        if(user.active === 0 || user.active ===2){
            throw new HttpException(401, 'Account is not active');
        }

         const isMatch = await bcrypt.compare(pass, user.password);
       
        if (!isMatch) {
            throw new HttpException(401, 'Incorrect password!');
        }

        // user matched!
        const secretKey = process.env.SECRET_JWT || "";
        const token = jwt.sign({ user_id: user.id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        const { password, ...userWithoutPassword } = user;

        res.send({ ...userWithoutPassword, token });
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