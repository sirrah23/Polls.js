/*
 * This file exports an object that can perform 
 * the operations we want on our SQL tables.
 */

/*First obtain connection to MySQL database*/
var dbcred = require('../dbcred.json');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('polls',dbcred.user,dbcred.password,
                              { host: 'localhost',
                                dialect: 'mysql',
                                logging: false,
                              });

/*Obtain the tables in from our database*/
var question = require('../models/question.js')(sequelize); //table that contains poll questions
var answer = require('../models/answer.js')(sequelize); //table that contains poll answers
var qa = require('../models/questionanswer.js')(sequelize,Question,Answer); //question-answer junction table

