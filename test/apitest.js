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
