const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createUserSchema, updateUserSchema, validateLogin } = require('../middleware/validators/userValidator.middleware');


router.get('/', auth(), awaitHandlerFactory(userController.getAllUsers)); // localhost:3000/api/v1/users   getUser by Token
router.get('/id/:id', auth(), awaitHandlerFactory(userController.getUserById)); // localhost:3000/api/v1/users/id/1 getUser by ID
router.get('/username/:username', auth(), awaitHandlerFactory(userController.getUserByuserName)); // localhost:3000/api/v1/users/usersname/julia
router.get('/whoami', auth(), awaitHandlerFactory(userController.getCurrentUser)); // localhost:3000/api/v1/users/whoami
router.post('/', createUserSchema, awaitHandlerFactory(userController.createUser)); // localhost:3000/api/v1/users
router.patch('/id/:id', auth(Role.Admin), updateUserSchema, awaitHandlerFactory(userController.updateUser)); // localhost:3000/api/v1/users/id/1 , using patch for partial update
router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(userController.deleteUser)); // localhost:3000/api/v1/users/id/1
router.lock('/id/:id', auth(Role.Admin), awaitHandlerFactory(userController.lockUser)); // localhost:3000/api/v1/users/id/1
router.get('/confirmation/:token', awaitHandlerFactory(userController.confirmUser)); // localhost:3000/api/v1/users/id/1
router.get('/vocalists',auth() ,awaitHandlerFactory(userController.getVocalists));
router.get('/producers',auth() ,awaitHandlerFactory(userController.getProducers));
//main message
router.post('/createMessage', auth(), awaitHandlerFactory(userController.createMessage));
//each message inside main message
router.post('/sendMessage', auth(), awaitHandlerFactory(userController.sendMessage));
//main message by userID
router.get('/getMessages/:id',auth() ,awaitHandlerFactory(userController.getMessages));
//each inside main message by messageID
router.get('/getEachMessages/:id',auth() ,awaitHandlerFactory(userController.getEachMessages));

//removeMessage
router.post('/deleteMessage',auth() ,awaitHandlerFactory(userController.deleteMessage));

//tracks
router.get('/tracks',auth() ,awaitHandlerFactory(userController.getAllTracks));


router.post('/login', validateLogin, awaitHandlerFactory(userController.userLogin)); // localhost:3000/api/v1/users/login


module.exports = router;