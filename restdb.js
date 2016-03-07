var app = require('./app.js');
app.listen(3000,function(err){
  if (err){
    console.log('ERROR: ' + err.message);
  } else {
    console.log('Listening on PORT 3000');
  }
});
