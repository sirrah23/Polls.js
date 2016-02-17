/*Create model for question/answer junction table */
function initQuestionAnswer(database,question,answer){
  var Sequelize = require('sequelize');
  var sequelize = database;
  var QuestionAnswer = sequelize.define('QuestionAnswer');
  question.hasMany(QuestionAnswer, {foreignKey: 'qID',
                                    constraints: false});
  answer.hasMany(QuestionAnswer, {foreignKey: 'aID',
                                  constraints: false});
  return QuestionAnswer;
}

module.exports = initQuestionAnswer;
