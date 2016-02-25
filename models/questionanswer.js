/*Create model for question/answer junction table */
function initQuestionAnswer(database,question,answer){
  var Sequelize = require('sequelize');
  var sequelize = database;
  var QuestionAnswer = sequelize.define('QuestionAnswer');
  //Create junction table mapping questions and answers
  question.belongsToMany(answer, {through: QuestionAnswer,
                                  foreignKey:'answerID',
                                  constraints:false});
  answer.belongsToMany(question, {through: QuestionAnswer,
                                  foreignKey:'questionID',
                                  constraints: false});
  return QuestionAnswer;
}

module.exports = initQuestionAnswer;
