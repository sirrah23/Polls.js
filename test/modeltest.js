var assert = require('assert');
var dbcred = require('../dbcred.json');

//Connect to mysql database
var Sequelize = require('sequelize');
var sequelize = new Sequelize('pollstest',dbcred.user,dbcred.password,
    { host: 'localhost',
      dialect: 'mysql',
      logging: false
});

describe('Answer',function(){ var AnswerInit = require('../models/answer.js');
    var Answer = AnswerInit(sequelize);
    it('should be created successfully',function(){
        return Answer.drop()
          .then(function(){
            return Answer.sync();
          })
          .then(function(){
              return Answer.findAll();
          })
          .then(function(answers){
              assert.notEqual(answers,null);
          })
          .catch(function(err){
            console.log(err);
            assert(false);
          });
    });

    it('should be able to accept table entries',function(){
        return Answer.create({answer: 'This is a test'})
            .then(function(){
                return Answer.findOne({where: {answer: 'This is a test'}});
            })
            .then(function(a){
                assert.equal(a.dataValues.answer,'This is a test');
            })
            .catch(function(err){
              console.log(err);
              assert(false);
            });
    });
});

describe('Question',function(){
    var QuestionInit = require('../models/question.js');
    var Question = QuestionInit(sequelize);

    it('should be created successfully',function(){
        return Question.drop()
        .then(function(){
          return Question.sync();
        })
        .then(function(){
            return Question.findAll();
        })
        .then(function(questions){
            assert.notEqual(null,questions);
        })
        .catch(function(err){
          console.log(err);
          assert(false);
        });
    });

    it('should be able to accept table entries',function(){
        return Question.create({question: 'This is a question.'})
            .then(function(){
              return Question.findOne({where: {question: 'This is a question.'}});
            })
            .then(function(q){
                assert.equal(q.dataValues.question,'This is a question.');
            })
            .catch(function(err){
              console.log(err);
              assert(false);
            });
    });
});

describe('QuestionAnswer',function(){
    var QuestionInit = require('../models/question.js');
    var Question = QuestionInit(sequelize);
    var AnswerInit = require('../models/answer.js');
    var Answer = AnswerInit(sequelize);
    var QAInit= require('../models/questionanswer.js');
    var QuestionAnswer = QAInit(sequelize,Question,Answer);
    var models = [Question,Answer,QuestionAnswer];
    it('should be created successfully',function(){
      return Promise.all(models.map(function(m){return m.drop();}))
        .then(function(){
          return Promise.all(models.map(function(m){return m.sync();}));
        })
        .then(function(ms){
          return QuestionAnswer.findAll();
        })
        .then(function(qas){
          assert.notEqual(null,qas);
        })
        .catch(function(err){
          console.log(err);
          assert(false);
        });
    });

  it('should act as a junction table',function(){
    return Question.create({question: 'Is this a test?'})
      .then(function(newQuestion){
        return Answer.create({answer: 'This is an answer.'})
          .then(function(newAnswer){
            return newAnswer.setQuestions(newQuestion);
          });
      })
      .then(function(){
        return QuestionAnswer.findAll();
      })
      .then(function(newQA){
        //Assert a question and answer pair were added to the junction table
        assert.deepEqual([newQA[0].dataValues.questionID,newQA[0].dataValues.answerID],[1,1]);
        return;
      })
      .catch(function(err){
        console.log(err);
        assert(false);
        return;
      });
  });
});
