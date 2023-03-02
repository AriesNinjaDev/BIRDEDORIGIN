

var express = require('express');
var app = express();
var server = require('http').Server(app);

const dbc = require('./server/dbc');
const mail = require('./server/mail');
const crypto = require('crypto');

function gsi() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random}`;
}


app.get('/',function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + "/public"));


app.get('*', function(req, res){
  res.status(404).sendFile(__dirname+'/intercept/index.html');
});

server.listen(8080);

function hash(string) {
  const hash = crypto.createHash('sha256');
  hash.update(string);
  return hash.digest('hex');
}

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
  
  socket.on('serverUsernameCompare', function(email, username, rpwd) {
    donehash = hash(rpwd)
    var trres
    var brres
    dbc.chkUsername(username)
  .then(result => {
    trres = result

    dbc.chkEmail(email, username)
  .then(result => {
    brres = result

    socket.emit("serverUsernameCompareResult", brres, trres, donehash);
  })
  .catch(error => {
    console.log(error);
    // Handle the error
  });
   
  })
  .catch(error => {
    console.log(error);
    // Handle the error
  });
   
  });

  socket.on('vhashCheck', function(providedHash) {
    var allowed
    dbc.chkVerifyHash(providedHash)
  .then(result => {
    allowed = result;
    socket.emit("vhashCheckResult", allowed);
  })
  .catch(error => {
    console.log(error);
    // Handle the error
  });
   
  });

  socket.on("createUserAccount", (ema, use, pas) => {
  const codeI = Math.floor(Math.random() * (999999 - 111111 + 1) + 111111);
  const idI = gsi();
  dbc.registerUser(ema,use,pas,codeI,idI);
  mail.sendVerification(ema,codeI)
   socket.emit("redirectV", idI);
  
});

  socket.on("getCode", (ide) => {
  dbc.idToCode(ide)
 .then(result => {
    allowed = result;
    socket.emit("codeCheckout", allowed);
  })
  .catch(error => {
    console.log(error);
    // Handle the error
    
  });

});

  socket.on("VALIDATE", (ide) => {
  dbc.sendVerify(ide)
   .then(result => {
    allowed = result;
    socket.emit("vS", allowed);
  })
  .catch(error => {
    console.log(error);
    // Handle the error
  });
    
});

});

  

console.log("Thread > Server Online with 0 errors.")


