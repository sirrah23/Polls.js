/*Create model for question/answer junction table */
function initQuestionAnswer(database,question,answer){
  var sequelize = database;
  var QuestionAnswer = sequelize.define('QuestionAnswer',
    questionID: {
      type:Sequelize.INTEGER, 
      autoIncrement: true,
      primaryKey: true, 
      references: { 
        model: 'Question',
        key: 'questionID', 
      }
    },
    answerID: {
      type:Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
      references: {
        model: 'Answer',
        key: 'answerID',
      }
    },
  });
  //foreign keys
  QuestionAnswer.hasOne(question);
  QuestionAnswer.hasMany(answer);
  return QuestionAnswer
}
