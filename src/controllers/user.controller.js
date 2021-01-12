const UserModel = require('../models/user.model.js');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Verify = require('../utils/verify')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/******************************************************************************
 *                              User Controller
 ******************************************************************************/
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});



class UserController {


    getAllUsers = async (req, res, next) => {
        let userList = await UserModel.find({active:1});
        if (!userList.length) {
            throw new HttpException(404, 'Users not found');
        }

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.send(userList);
    };

    getUserById = async (req, res, next) => {
        const user = await UserModel.findOne({ id: req.params.id,active:1});
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
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
      console.log(req.body.password)
      console.log(req.body.password.replace("[^a-zA-Z]",""))
        res.status(201).send('User was created!');
       
        let mailOptions = {
            from: process.env.GMAIL_USER,
            to: req.body.email,
            subject: 'You registered successfully',
            text: 'That was easy!',
            html: Verify.confirmEmail(req.body.password.replace(/\//g, "slash"))
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });


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

 
    confirmUser = async (req, res, next) => {
        const update = {
            active:1
        }
       
         const result = await UserModel.confirm(update,req.params.token.replace(/slash/g, "/"));
         if (!result) {
             throw new HttpException(404, 'User not found');
         }
         res.send('User confirmed');
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
     
        if(user.active === 0 || user.active === 2){
            throw new HttpException(401, 'Account is not active');
        }
        if(user.active === 3) {
           throw new HttpException(401, 'Your email is not activated please check your email')
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
module.exports = new UserController;