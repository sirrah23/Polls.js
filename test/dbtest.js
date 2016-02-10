var assert = require('assert');
var dbcred = require('../dbcred.json');

//Connect to mysql database
var Sequelize = require('sequelize');
var sequelize = new Sequelize('pollstest',dbcred.user,dbcred.password,
    { host: 'localhost',
      dialect: 'mysql',
      logging: false,
});

describe('Answer',function(){
    var AnswerInit = require('../models/answer.js');
    var Answer = AnswerInit(sequelize);
    Answer.drop();
    it('should be created successfully',function(){
        return Answer.sync()
            .then(function(){
                return Answer.findAll();
            })
            .then(function(answers){
                assert.equal(answers.length,0);
            });
    });

    it('should be able to accept table entries',function(){
        return Answer.create({answer: 'This is a test'})
            .then(function(){
                return Answer.findOne({where: {answer: 'This is a test'}});
            })
            .then(function(a){
                assert.equal(a.dataValues.answer,'This is a test');
            });
    });
});


describe('Question',function(){
    var QuestionInit = require('../models/question.js');
    var Question = QuestionInit(sequelize);
    Question.drop();
    it('should be created successfully',function(){
        return Question.sync()
            .then(function(){
                return Question.findAll();
            })
            .then(function(questions){
                assert.equal(0,questions.length);
            });
    });
    it('should be able to accept table entries',function(){
        return Question.create({question: 'This is a question.'})
            .then(function(){
                return Question.findOne({where: {question: 'This is a question.'}});
            })
            .then(function(q){
                assert.equal(q.dataValues.question,'This is a question.');
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
        Question.drop(); Answer.drop(); QuestionAnswer.drop();
        return QuestionAnswer.sync()
            .then(function(){
                return QuestionAnswer.findAll();
            })
            .then(function(qas){
                assert.equal(0,qas.length);
            });
    });
});
