var assert = require('assert');
var dbcred = require('../dbcred.json');

//Connect to mysql database
var Sequelize = require('sequelize')
var sequelize = new Sequelize('pollstest',dbcred.user,dbcred.password,
    { host: 'localhost', 
      dialect: 'mysql',
      logging: false,
});
//Clear test database
sequelize.drop();

describe('Answer',function(){
    it('Answer should be created successfully',function(){
        var AnswerInit = require('../models/answer.js');
        var Answer = AnswerInit(sequelize);
        Answer.sync()
            .then(function(){
                return Answer.findAll()
            })
            .then(function(answers){
                assert.equal(0,answers.length);
            })
            .catch(function(err){
                console.log(err);
                assert.equal(1,2);
            });
    });
});


describe('Question',function(){
    it('Question should be created successfully',function(){
        var QuestionInit = require('../models/question.js');
        var Question = QuestionInit(sequelize);
        Question.sync()
            .then(function(){
                return Question.findAll()
            })
            .then(function(questions){
                assert.equal(0,questions.length);
            })
            .catch(function(err){
                console.log(err);
                assert.equal(1,2);
            });
    });
});

describe('QuestionAnswer',function(){
    it('QuestionAnswer should be created successfully',function(){
        var QuestionInit = require('../models/question.js');
        var Question = QuestionInit(sequelize);
        var AnswerInit = require('../models/answer.js');
        var Answer = AnswerInit(sequelize);
        var QAInit= require('../models/questionanswer.js');
        var QuestionAnswer = QAInit(sequelize,Question,Answer);
        QuestionAnswer.sync()
            .then(function(){
                console.log('ayy lmao');
                return QuestionAnswer.findAll()
            })
            .then(function(qas){
                assert.equal(0,qas.length);
            })
            .catch(function(err){
                console.log(err);
                assert.equal(1,2);
            });
    });
});
