const { body, check } = require('express-validator');
const Role = require('../../utils/userRoles.utils');
const Utils = require('../../utils/helpers.utils')


exports.createUserSchema = [
    check('username')
        .exists()
        .withMessage('username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 chars long'),
    check('first_name')
        .exists()
        .withMessage('Your first name is required')
        .isAlpha()
        .withMessage('First name must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 chars long'),
    check('last_name')
        .exists()
        .withMessage('Your last name is required')
        .isAlpha()
        .withMessage('Last name must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Last Name must be at least 3 chars long'),
    check('email')
        .exists()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email'),
    check('password')
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .isLength({ max: 10 })
        .withMessage('Password can contain max 10 characters'),
    check('confirm_password')
        .exists()
        .withMessage('Password is required')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('confirm_password field must have the same value as the password field'),
    check('age')
        .exists()
        .withMessage('age is required')
        .isNumeric()
        .withMessage('age must be a number'),
    check('gender')
        .exists()
        .withMessage('gender is required')
        .isIn([Utils.Male, Utils.Female])
        .withMessage('Gender is not correct'),
    check('type')
        .exists()
        .withMessage('type is required')
        .isIn([Utils.Producer, Utils.Vocalist, Utils.Both])
        .withMessage('type is not correct')

];

exports.updateUserSchema = [
    check('username')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    check('first_name')
        .optional()
        .isAlpha()
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    check('last_name')
        .optional()
        .isAlpha()
        .withMessage('Must be only alphabetical chars')
        .isLength({ min: 3 })
        .withMessage('Must be at least 3 chars long'),
    check('email')
        .optional()
        .isEmail()
        .withMessage('Must be a valid email'),
    check('role')
        .optional()
        .isIn([Role.Admin, Role.SuperUser])
        .withMessage('Invalid Role type'),
    check('password')
        .optional()
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .isLength({ max: 10 })
        .withMessage('Password can contain max 10 characters')
        .custom((value, { req }) => !!req.body.confirm_password)
        .withMessage('Please confirm your password'),
    check('confirm_password')
        .optional()
        .custom((value, { req }) => value === req.body.password)
        .withMessage('confirm_password field must have the same value as the password field'),
    check('age')
        .optional()
        .isNumeric()
        .withMessage('Must be a number'),
    body()
        .custom(value => {
            return !!Object.keys(value).length;
        })
        .withMessage('Please provide required field to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['username', 'password', 'confirm_password', 'email', 'role', 'first_name', 'last_name', 'age'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.validateLogin = [
    check('email')
        .exists()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email')
    ,
    check('password')
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password must be filled')
];