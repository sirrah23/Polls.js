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
    it('should be created successfully',function(){
      var QuestionInit = require('../models/question.js');
      var Question = QuestionInit(sequelize);
      var AnswerInit = require('../models/answer.js');
      var Answer = AnswerInit(sequelize);
      var QAInit= require('../models/questionanswer.js');
      var QuestionAnswer = QAInit(sequelize,Question,Answer);
      var models = [Question,Answer,QuestionAnswer];

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
});
