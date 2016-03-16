/*
 * Argument tells you which database
 * to connect to, on what server
 */

module.exports = function(dbInfo){
  var express = require('express');
  var router = express.Router();
  var _ = require('lodash');
  var Promise = require('bluebird');

  /*
  * Initialize the MySQL ORM
  */
  var dbcred = require('../dbcred.json');

  //Connect to mysql database
  var Sequelize = require('sequelize');
  var sequelize = new Sequelize(dbInfo.db,
                                dbcred.user,
                                dbcred.password,
                                { host: dbInfo.host,
                                  dialect: dbInfo.dialect,
                                  logging: dbInfo.logging
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

  /*Get a poll by it's id as JSON*/
  router.get('/polls/:id',function(req,res,next){
    dbInstance.getPollByID(req.params.id)
      .then(function(poll){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(poll)); //Send back JSON object containing polls
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

  router.delete('/polls/:id',function(req,res,next){
    dbInstance.deletePollByID(req.params.id)
      .then(function(result){
        if (_.isEmpty(result)){
          res.sendStatus(404);
        } else {
          res.send(JSON.stringify(result));
        }
      });
  });

  router.delete('/polls',function(req,res,next){
    dbInstance.deleteAll()
      .then(function(result){
        if (_.isEmpty(result)){
          res.sendStatus(404);
        } else {
          res.send(JSON.stringify(result));
        }
      });
  });

  return router;
};
