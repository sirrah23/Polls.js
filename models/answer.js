/*Create model for answer table*/
function initAnswer(database){
  var Sequelize = require('sequelize');
  //refers to location of the database
  var sequelize = database;
  //define table
  var Answer = sequelize.define('Answers',{
    answerID: {type:Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    answer: Sequelize.STRING,
    votes: {type:Sequelize.INTEGER, defaultValue: 0}
  });
  return Answer;
}

module.exports = initAnswer;
