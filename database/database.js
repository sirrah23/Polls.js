/*
 * This file exports an object that can perform
 * the operations we want on our SQL tables.
 */

/*First obtain connection to MySQL database*/
var dbcred = require('../dbcred.json');
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');

var sequelize = new Sequelize('polls',dbcred.user,dbcred.password,
                              { host: 'localhost',
                                dialect: 'mysql',
                                logging: false
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
  return sequelize.transaction(function (t){ //Run a SQL transaction
    return question.create({question: poll.question},{transaction: t}) //Add question to question table
      .then(function(newQuestion){
        return Promise.map(poll.answers,function(ans){ // Add answers to answer table
          return answer.create({answer:ans});
        },{transaction: t})
          .then(function(newAnswers){
            return newQuestion.addAnswers(newAnswers); //Add question+answers to junction table
          },{transaction:t});
      });
  })
  .then(function(result){
    return result; // Throw an error here later
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
  return question.findAll({include:[answer]})
    .then(function(pollDataValues){
      //Go through data and retrieve question strings
      var dbQuestions = pollDataValues.map(function(pollDataValue){
        return pollDataValue.dataValues.question;
      });
      //Go through data and retrieve arrays of answers for each question
      var dbAnswers = pollDataValues
        .map(function(pollDataValue){
          return pollDataValue.Answers;
        })
        .map(function(answerSet){
          return answerSet.map(function(answerMemb){
            return answerMemb.dataValues.answer;
          });
        });
      //Create the JSON object to be returned
      var qaJSON = _.zip(dbQuestions,dbAnswers)
                    .map(function(qaPair){
                      return _.zipObject(['question','answers'],qaPair);
                    });
      return(qaJSON);
    })
    .catch(function(err){
      console.log(err);
    });
}

//createPoll({'question':'Testing?????','answers':['dddd','l','aasdf','yolo']});
//getAllPolls();
