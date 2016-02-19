/*
 * This file exports an object that can perform
 * the operations we want on our SQL tables.
 */

/*First obtain connection to MySQL database*/
var dbcred = require('../dbcred.json');
var Sequelize = require('sequelize');
var Promise = require('bluebird');

var sequelize = new Sequelize('polls',dbcred.user,dbcred.password,
                              { host: 'localhost',
                                dialect: 'mysql',
                                logging: false,
                              });

/*Obtain the tables in from our database*/
var question = require('../models/question.js')(sequelize); //table that contains poll questions
var answer = require('../models/answer.js')(sequelize); //table that contains poll answers
var qa = require('../models/questionanswer.js')(sequelize,question,answer); //question-answer junction table

question.sync();
answer.sync();
qa.sync();

/*
 * Given a JSON object that contains a question string
 * and an array of answers, a SQL transaction will run
 * that will add the question to the Questions table,
 * the answers to the Answers table, and all the IDs
 * from these entries to the QA junction table.
 */
function createPoll(poll){
  return sequelize.transaction(function(t){
    var insertedData = {};
    return question.create({question:poll.question})
      .then(function(insertedQuestion){
        insertedData.question = insertedQuestion;
        return Promise.map(poll.answers,function(ans){
          return answer.create({answer:ans});
        });
      },{transaction:t})
      .then(function(insertedAnswers){
        insertedData.answers = insertedAnswers;
        return;
      },{transaction:t})
      .then(function(){
        Promise.map(insertedData.answers,function(insAns){
          return qa.create({qID:insertedData.question.dataValues.questionID,
                            aID:insAns.dataValues.answerID
                           });
        });
      },{transaction:t});
  })
  .catch(function(err){
    console.log(err);
    return;
  });
}


/*
 * This function returns a JSON object
 * containing all the polls in the database
 * with a Question string and an array of Answer
 * strings
 */
function getAllPolls(){
  return qa.findAll()
    .then(function(x){console.log(x);})
    .catch(function(err){
      console.log(err);
    });
}

createPoll({'question':'Testing?????','answers':['dddd','l','aasdf','yolo']});
