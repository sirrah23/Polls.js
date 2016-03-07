var express = require('express');
var router = express.Router();

var Promise = require('bluebird');

/*
 * Initialize the MySQL ORM
*/
var dbcred = require('../dbcred.json');

//Connect to mysql database
var Sequelize = require('sequelize');
var sequelize = new Sequelize('polls',dbcred.user,dbcred.password,
                              { host: 'localhost',
                                dialect: 'mysql',
                                logging: false
                              });

/*Obtain the tables in from our database*/
var question = require('../models/question.js')(sequelize); //table that contains poll questions
var answer = require('../models/answer.js')(sequelize); //table that contains poll answers
var qa = require('../models/questionanswer.js')(sequelize,question,answer); //question-answer junction table

var DB = require('../database/database.js'); //Module containing database functions
var dbInstance = new DB(sequelize,question,answer,qa); //instance of DB orm

question.sync()
  .then(function(){
    answer.sync();
  })
  .then(function(){
    qa.sync();
  });

/*Get all polls in database as JSON*/
router.get('/polls', function(req, res, next) {
  dbInstance.getAllPolls() //Obtain polls in database
    .then(function(polls){
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(polls)); //Send back JSON object containing polls
    });
});

/*Create a poll based on JSON sent by user*/
router.post('/create/poll',function(req,res,next){
  var keys = Object.keys(req.body);
  var keyIndices = [keys.indexOf('question'),keys.indexOf('answers')];
  for ( var i = 0 ; i < keyIndices.length;i++){
    //If JSON does not contain proper information
    if (keyIndices[i] == -1){
      //Return bad request
      res.sendStatus(400);
      return;
    }
  }
  dbInstance.createPoll(req.body) 
    .then(function(pollNew){
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(pollNew));
    });
});

module.exports = router;
