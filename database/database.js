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
 * Given poll data, as retrieved from MySQL
 * via Sequelize, will convert the question-
 * answer data into the appropriate JSON format
 */
function pollToJSON(pollDataValues){
  //Go through data and retrieve question ids and strings
  var dbQuestionData = pollDataValues.map(function(pollDataValue){
    return {
      'id' : pollDataValue.dataValues.questionID,
      'question' : pollDataValue.dataValues.question
    };
  });
  //Split question data into its components
  var dbQuestionIDs = dbQuestionData.map(function(dbItem){return dbItem.id;});
  var dbQuestionStrings = dbQuestionData.map(function(dbItem){return dbItem.question;});
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
  var qaJSON = _.zip(dbQuestionIDs,dbQuestionStrings,dbAnswers)
                .map(function(qaData){
                  return _.zipObject(['questionID', 'question', 'answers'],qaData);

                });
  return qaJSON;
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
      return pollToJSON(pollDataValues);
    })
    .catch(function(err){
      console.log(err);
      return;
    });
}

/*
 * Given a poll ID, return the corresponding
 * poll in JSON format. If the poll does not
 * exist then return an empty object, {}.
 */
function getPollByID(id){
  return question.findAll({
    where: {
      questionID: id
    },
    include: [answer]
  })
    .then(function(pollDataValue){
      return pollToJSON(pollDataValue);
    })
    .catch(function(err){
      console.log(err);
      return;
    });
}

/*
 * Given an poll ID this function will remove
 * all questions and answers from their respective
 * tables in the database (including the junction table)
 */
function deletePollByID(id){
  return question.findAll({
    where: {
      questionID: id
    },
    include: [answer]
  })
    .then(function(pollDataValue){
      if(pollDataValue.length === 0){ //cannot delete because it doesn't exist in database
        return {};
      }
      var pollAnswers = pollDataValue[0].Answers;
      return pollDataValue[0].removeAnswers(pollAnswers) //Remove question-answer links in junction table
        .then(function(){
          return pollDataValue[0].destroy(); //remove question from Questions table
        })
        .then(function(){
          return Promise.map(pollAnswers,function(pollAnswer){
            return pollAnswer.destroy(); //remove these answers from Answers table
          });
        })
        .then(function(){
          return {"Success": true};
        });
    })
    .catch(function(err){
      console.log(err);
      return;
    });
}

/*
createPoll({'question':'This is a test','answers':['opt1','opt2','opt3','opt4']})
  .then(function(){
    return getAllPolls();
  });
*/
//getAllPolls().then(function(data){console.log(data);});
//getPollByID(6).then(function(data){console.log(data);});
//deletePollByID(3).then(function(val){console.log(val);});
