const UserModel = require('../models/user.model.js');
const TrackModel = require('../models/track.model.js');
const MessageModel = require('../models/message.model')
const BidModel = require('../models/bid.model')
const NotificationModel = require('../models//notifications.model')
const EachMessageModel = require('../models/each.message.model')
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Utils = require('../utils/helpers.utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bidModel = require('../models/bid.model.js');
dotenv.config();

/******************************************************************************
 *                              User Controller
 ******************************************************************************/



class UserController {


    getAllTracks = async (req, res, next) => {
        let trackList = await TrackModel.find();
        if (!trackList.length) {
            throw new HttpException(404, 'Users not found');
        }
        res.send(trackList);
    };



    getAllUsers = async (req, res, next) => {
        let userList = await UserModel.find({ active: 1 });
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
        const user = await UserModel.findOne({ id: req.params.id, active: 1 });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getUserByuserName = async (req, res, next) => {
        const user = await UserModel.findOne({ username: req.params.username, active: 1 });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getVocalists = async (req, res, next) => {

        const vocalists = await UserModel.find({ type: Utils.Vocalist, active: 1 });
        const both = await UserModel.find({ type: Utils.Both, active: 1 })

        if (!vocalists || !both) {
            throw new HttpException(404, 'User not found');
        }
        const all = both.concat(vocalists)

        let userList = all.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });


        res.send(userList);
    };




    getProducers = async (req, res, next) => {
        const producers = await UserModel.find({ type: Utils.Producer || Utils.Both, active: 1 });
        const both = await UserModel.find({ type: Utils.Both, active: 1 })
        if (!producers || !both) {
            throw new HttpException(404, 'User not found');
        }
        const all = both.concat(producers)

        let userList = all.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.send(userList);
    };


    getCurrentUser = async (req, res, next) => {

        const { password, ...userWithoutPassword } = req.currentUser;

        res.send(userWithoutPassword);
    };

    createUser = async (req, res, next) => {
        this.checkValidation(req, res);

        const email = await UserModel.findOne({ email: req.body.email })

        if (email) {
            throw new HttpException(409, 'This email is already registered');
        }


        const username = await UserModel.findOne({ username: req.body.username })
        if (username) {
            throw new HttpException(409, 'This username already exists');
        }


        await this.hashPassword(req);

        const result = await UserModel.create(req.body);

        if (!result) {
            throw new HttpException(409, 'Something went wrong');
        }
        const user = await UserModel.findOne({ email: req.body.email })

        res.status(201).json('User was created!');

        const secretKey = process.env.SECRET_JWT || "";
        const token = jwt.sign({ user_id: user.id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        Utils.MailSender(req.body.email, token)


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
            active: 0
        }
        const result = await UserModel.update(update, req.params.id);
        if (!result) {
            throw new HttpException(404, 'User not found');
        }
        res.send('User has been deleted');
    };

    createMessage = async (req, res, next) => {

        const result = await MessageModel.create(req.body);
        const lastInsertedID = await MessageModel.getLastInserted()


        let data = {
            message_id: lastInsertedID[0].id,
            sender_id: req.body.sender,
            sender_fullname: req.body.sender_fullname,
            sender_message: req.body.message
        }

        const create = await EachMessageModel.create(data)
        if (!result && create) {
            throw new HttpException(409, 'Something went wrong');
        }

        res.send(lastInsertedID[0])
    }

    sendMessage = async (req, res, next) => {
        const update = {
            sender_active: 1,
            reciever_active: 1
        }

        const updated = await MessageModel.update(update, req.body.message_id)
        const result = await EachMessageModel.create(req.body)

        if (!result && !updated) {
            throw new HttpException(409, 'Something went wrong');
        }

        res.status(200).json('Message sent!');
    }

    getWhichBidded = async (req, res, next) => {
        const result = await BidModel.userWhereBidded(req.params.id)
        if (!result) {
            throw new HttpException(409, 'Something went wrong');
        }
        res.send(result)
    }

    getMessages = async (req, res, next) => {
        const result = await MessageModel.getMessage(req.params.id)

        if (!result) {
            throw new HttpException(409, 'Something went wrong');
        }

        res.status(200).json(result);
    }

    getEachMessages = async (req, res, next) => {
        const result = await EachMessageModel.find({ message_id: req.params.id })
        if (!result) {
            throw new HttpException(409, 'Something went wrong');
        }

        res.status(200).json(result);
    }

    deleteMessage = async (req, res, next) => {
        const update = {
            [req.body.type]: 0
        }

        const result = await MessageModel.update(update, req.body.id);
        if (!result) {
            throw new HttpException(404, 'Message not found');
        }
        res.send('Deleted');
    }

    getNotifications = async (req, res, next) => {
        const result = await NotificationModel.find({ toUser: req.params.id, active: 0 })

        if (!result) {
            throw new HttpException(404, 'Notification not found')
        }
        res.send(result)
    }

    readNotification = async (req,res,next) => {
        const update = {
            active:1
        }

        const result = await NotificationModel.update(update,req.params.id)
        if (!result) {
            throw new HttpException(404, 'Notification not found')
        }
        res.send('Notification read')
    }

    createNotification = async (req,res,next) => {
        const result = await NotificationModel.create(req.body)

        if (!result) {
            throw new HttpException(409, 'Something went wrong');
        }

        res.status(200).json('Notification sent!');
    }

    confirmUser = async (req, res, next) => {
        const update = {
            active: 1
        }

        const secretKey = process.env.SECRET_JWT || "";

        // Verify Token
        jwt.verify(req.params.token, secretKey, async (err, decoded) => {
            if (err) {
                res.send("your session is expired")
            } else {
                const result = await UserModel.confirm(update, decoded.user_id);
                if (!result) {
                    throw new HttpException(404, 'User not found');
                }
                res.redirect('https://vocalriserfront.herokuapp.com/');
            }
        });


    };



    lockUser = async (req, res, next) => {
        const update = {
            active: 2
        }

        const result = await UserModel.update(update, req.params.id);
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

        if (user.active === 0 || user.active === 2) {
            throw new HttpException(401, 'Account is not active');
        }
        if (user.active === 3) {
            const secretKey = process.env.SECRET_JWT || "";
            const token = jwt.sign({ user_id: user.id.toString() }, secretKey, {
                expiresIn: '24h'
            });

            Utils.MailSender(req.body.email, token)

            throw new HttpException(401, 'Your email is not activated please check your email within 24 hours, we sent email to you again')
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

    checkValidation = (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log(errors.errors)
            throw new HttpException(400, `Validation failed`, errors.errors);
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