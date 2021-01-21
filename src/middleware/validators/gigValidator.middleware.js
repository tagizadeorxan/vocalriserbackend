const { body, check } = require('express-validator');
const { format } = require('mysql2');
const Utils = require('../../utils/helpers.utils');


exports.createGigSchema = [
   check('user_id')
   .exists()
   .withMessage('user_id required')
   .isInt()
   .withMessage('user_id must be integer'),
   check('name')
   .exists()
   .withMessage('name required')
   .isLength({min:5})
   .withMessage('name string must be more than 5 letter'),
   check('expireDate')
   .exists()
   .withMessage('expire date required')
   .isDate(format("YYYY-MM-DD"))
   .withMessage('expire date format error'),
   check('createDate')
   .exists()
   .withMessage('create date required')
   .isDate(format("YYYY-MM-DD"))
   .withMessage('create date format error'),
   check('budgetMin')
   .exists()
   .withMessage('budgetMin required')
   .isInt()
   .withMessage('budgetMin must be integer'),
   check('budgetMax')
   .exists()
   .withMessage('budgetMax required')
   .isInt()
   .withMessage('budgetMax must be integer'),
   check('gender')
   .exists()
   .withMessage('gender required')
   .isIn([Utils.Female,Utils.Male])
   .withMessage('Gender only Male or Female'),
   check('type')
   .exists()
   .withMessage('type required')
   .isIn([Utils.Producer,Utils.Vocalist])
   .withMessage('Type only Vocalist or Producer'),

];

exports.updateGigSchema = [
   
];

