var assert = require('assert');
var Promise = require('bluebird');
var dbcred = require('../dbcred.json');

//Connect to mysql database
var Sequelize = require('sequelize');
var sequelize = new Sequelize('pollstest',dbcred.user,dbcred.password,
                              { host: 'localhost',
                                dialect: 'mysql',
                                logging: false
                              });

/*Obtain the tables in from our database*/
var question = require('../models/question.js')(sequelize); //table that contains poll questions
var answer = require('../models/answer.js')(sequelize); //table that contains poll answers
var qa = require('../models/questionanswer.js')(sequelize,question,answer); //question-answer junction table

var DB = require('../database/database.js'); //Module containing database functions
var dbInstance = new DB(sequelize,question,answer,qa);

describe('Create Poll',function(){
  var poll = {'question': 'What is the question?', answers: ['answer1','answer2','answer3']};
  it('should create a poll',function(){
    return Promise.map([question,answer,qa],function(table){
      return table.drop();
    })
      .then(function(){
        return Promise.map([question,answer,qa],function(table){
          return table.sync();
        });
      })
      .then(function(){
        return dbInstance.createPoll(poll);
      })
      .then(function(addedPoll){
        //make sure we added three answers
        assert.equal(addedPoll[0].length,3);
        //Make only added one question with that id of 1
        assert.deepEqual([1,1,1],addedPoll[0].map(function(added){return added.questionID;}));
        //Make sure all three answers got added with unique ids
        assert.deepEqual([1,2,3],addedPoll[0].map(function(added){return added.answerID;}));
      })
      .catch(function(err){
        console.log(err);
        assert(false);
      });
  });
});
