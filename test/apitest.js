var request = require('request');
var assert = require('assert');
var baseAddress = 'http://localhost:3000';

before(function(done){
  var dbInfo = {
    db: 'pollstest',
    host: 'localhost',
    dialect: 'mysql',
    logging: false
  };
  var app = require('../app.js')(dbInfo);
  app.listen(3000,function(err){
    if (err){
      console.log('ERROR: ' + err.message);
    } else {
      console.log('Listening on PORT 3000');
    }
  });
  // Clear database before tests
  var options = {
    method: 'delete',
    url: baseAddress+'/api/polls'
  };
  request(options,function(err,res,body){
    done();
  });
});

describe('Create Poll',function(){
  var poll = {'question': 'What is the question?', answers: ['answer1','answer2','answer3']};
  var options = {
    method: 'post',
    body: poll,
    json: true,
    url: baseAddress+'/api/create/poll'
  };
  it('should create a poll',function(done){
    request(options,function(err,res,body){
      assert.equal(body[0].length,3); // 3 answers put into DB
      done();
    });
  });
});


describe('Get Polls',function(){
  var options = {
    method: 'get',
    json: true,
    url: baseAddress+'/api/polls'
  };
  it('should get all polls',function(done){
    request(options,function(err,res,body){
      assert.equal(body.length,1);
      assert.deepEqual(body[0].answers,['answer1','answer2','answer3']);
      done();
    });
  });
});

describe('Get poll by id',function(){
  var poll = {'question': 'What is the question?', answers: ['answer1','answer2','answer3']};
  var getOptions = {
    method: 'get',
    json: true,
    url: baseAddress+'/api/polls/1'
  };
  it('should get a poll by id',function(done){
    request(getOptions,function(err,res,body){
      assert.equal(body.length,1);
      assert.equal(body[0].question,poll.question);
      assert.deepEqual(body[0].answers,poll.answers);
      done();
    });
  });
});


describe('Delete a poll by id',function(){
  var getOptions = {
    method: 'delete',
    json: true,
    url: baseAddress+'/api/polls/1'
  };
  it('should delete a poll',function(done){
    request(getOptions,function(err,res,body){
      assert.equal(body.Success,true);
      done();
    });
  });
});
