/*Create model for answer table*/
function initAnswer(database){
  var Sequelize = require('sequelize');
  //refers to location of the database
  var sequelize = database;
  //define table
  var Answer = sequelize.define('Answer',{
    answerID: {type:Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    answer: Sequelize.STRING
  });
  return Answer;
}

module.exports = initAnswer;
