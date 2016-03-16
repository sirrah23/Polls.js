/*
 * This file exports an object that can perform
 * the operations we want on our SQL tables.
 */ 
/*First obtain connection to MySQL database*/
var dbcred = require('../dbcred.json');
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');

/*
 * Constructor for database object
 */
function db(sequelize, question, answer, qa){
  this.sequelize = sequelize;
  this.question = question;
  this.answer = answer;
  this.qa = qa;
}

/*
 * Given a JSON object that contains a question string
 * and an array of answers, a SQL transaction will run
 * that will add the question to the Questions table,
 * the answers to the Answers table, and all the IDs
 * from these entries to the QA junction table.
 */
db.prototype.createPoll = function(poll){
  var self = this;
  return self.sequelize.transaction(function (t){ //Run a SQL transaction
    return self.question.create({question: poll.question},{transaction: t}) //Add question to question table
      .then(function(newQuestion){
        return Promise.map(poll.answers,function(ans){ // Add answers to answer table
          return self.answer.create({answer:ans});
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
db.prototype.pollToJSON = function(pollDataValues){
  var self = this;
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
db.prototype.getAllPolls = function(){
  var self = this;
  return self.question.findAll({include:[self.answer]})
    .then(function(pollDataValues){
      return self.pollToJSON(pollDataValues);
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
db.prototype.getPollByID = function(id){
  var self = this;
  return self.question.findAll({
    where: {
      questionID: id
    },
    include: [self.answer]
  })
    .then(function(pollDataValue){
      return self.pollToJSON(pollDataValue);
    })
    .catch(function(err){
      console.log(err);
      return;
    });
}

/*
 * Given an poll ID self function will remove
 * all questions and answers from their respective
 * tables in the database (including the junction table)
 */
db.prototype.deletePollByID = function(id){
  var self = this;
  return self.question.findAll({
    where: {
      questionID: id
    },
    include: [self.answer]
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
 * Drops all tables in the database.
*/
db.prototype.deleteAll = function(){
  var that = this;
  return Promise.map([that.question,that.answer,that.qa],function(table){
    return table.drop();
  })
  .then(function(){
    return Promise.map([that.question,that.answer,that.qa],function(table){
      return table.sync();
    });
  })
  .then(function(){
    return {"Success": true};
  })
  .catch(function(err){
    console.log(err);
    return {};
  });
}


module.exports = db;
