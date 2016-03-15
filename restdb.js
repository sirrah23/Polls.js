var dbInfo = {
  db: 'polls',
  host: 'localhost',
  dialect: 'mysql',
  logging: false
};
var app = require('./app.js')(dbInfo);
app.listen(3000,function(err){
  if (err){
    console.log('ERROR: ' + err.message);
  } else {
    console.log('Listening on PORT 3000');
  }
});
