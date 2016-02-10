/*Create model for question table*/
function initQuestion(database){
  var Sequelize = require('sequelize');
  var sequelize = database;
  var Question = sequelize.define('Question',{
    questionID: {type:Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    question: Sequelize.STRING,
  });
  return Question;
}

module.exports = initQuestion;
