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
      assert.deepEqual(addedPoll[0].map(function(added){return added.questionID;}),[1,1,1]);
      //Make sure all three answers got added with unique ids
      assert.deepEqual(addedPoll[0].map(function(added){return added.answerID;}),[1,2,3]);
    })
    .catch(function(err){
      console.log(err);
      assert(false);
    });
  });
});


describe('Get all Polls',function(){
  var poll = [{'question': 'What is this question?', answers: ['answer1','answer2','answer3']},
              {'question': 'What is that?', answers: ['answer4','answer5','answer6']}];
  it('should get all polls',function(){
    return Promise.map([question,answer,qa],function(table){
      return table.drop();
    })
      .then(function(){
        return Promise.map([question,answer,qa],function(table){
          return table.sync();
        });
      })
      .then(function(){
        return dbInstance.createPoll(poll[0]);
      })
      .then(function(){
        return dbInstance.createPoll(poll[1]);
      })
      .then(function(){
        return dbInstance.getAllPolls();
      })
      .then(function(dbPolls){
        assert.equal(2,dbPolls.length);
        assert.deepEqual(dbPolls.map(function(p){return p.questionID;}),[1,2]);
        assert.deepEqual(dbPolls.map(function(p){return p.question;}),[poll[0].question,poll[1].question]);
        assert.deepEqual(dbPolls.map(function(p){return p.answers;}),[poll[0].answers,poll[1].answers]);
      })
      .catch(function(err){
        console.log(err);
        assert(false);
      });
  });
});

describe('Get a poll', function(){
  it('should get a poll by ID',function(){
    var poll = [{'question': 'What is this question?', answers: ['answer1','answer2','answer3']},
                {'question': 'What is that?', answers: ['answer4','answer5','answer6']}];
    return Promise.map([question,answer,qa],function(table){
      return table.drop();
    })
      .then(function(){
        return Promise.map([question,answer,qa],function(table){
          return table.sync();
        });
      })
      .then(function(){
        return dbInstance.createPoll(poll[0]);
      })
      .then(function(){
        return dbInstance.createPoll(poll[1]);
      })
      .then(function(){
        return dbInstance.getPollByID(1);
      })
      .then(function(pollOne){
        assert.equal(pollOne[0].questionID,1);
        assert.deepEqual(pollOne[0].question,poll[0].question);
        assert.deepEqual(pollOne[0].answers,poll[0].answers);
        return dbInstance.getPollByID(2);
      })
      .then(function(pollTwo){
        assert.equal(pollTwo[0].questionID,2);
        assert.deepEqual(pollTwo[0].question,poll[1].question);
        assert.deepEqual(pollTwo[0].answers,poll[1].answers);
      })
      .catch(function(err){
        console.log(err);
        assert(false);
      });
  });
});

describe('Delete a poll by ID',function(){
  it('should delete a poll given id',function(){
    var poll = {'question': 'What is the question?', answers: ['answer1','answer2','answer3']};
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
      .then(function(){
        return dbInstance.getAllPolls();
      })
      .then(function(pollNew){
        assert.equal(pollNew.length,1);
        return dbInstance.deletePollByID(1);
      })
      .then(function(){
        return dbInstance.getAllPolls();
      })
      .then(function(pollNew){
        assert.equal(pollNew.length,0);
      })
      .catch(function(err){
        console.log(err);
        assert(false);
      });
  });
});
