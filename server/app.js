var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var count = 0;
var usernames = [];
var waitinglist = [];
//new user adding
function insertval(val){ 
  if(usernames.indexOf(val.toLowerCase()) === -1){
     usernames.push(val.toLowerCase()); 
     return 1;
    }else{ 
      return -1;
    }
}


app.get('/', function(req, res){
  res.send('Test Server');
});

app.get('/live', function(req, res){
  res.send(''+(count+1));
});

app.post('/adduser', function(req, res){
  if(insertval(req.body.myusername) > 0){
    res.send('1');
  }else{
    res.send('0');
  }
});

io.on('connection', function(socket){
  var username = "";
  count++;
  //add user and send and recieve messages
  socket.on("init",function(data){
    socket.username = data.username;
    username = socket.username;
    console.log(username+" has connected");
    //algo to allot partner or push to waiting list
    if(waitinglist.length > 0){
      partner=waitinglist[0];
      socket.partner=partner;
      socket.partner.partner = socket;
      waitinglist.splice(0,1);
      socket.broadcast.to(partner.id).emit("partner", {id:socket.id,username:socket.username});
      io.to(socket.id).emit("partner", {id:partner.id,username:partner.username});
    }else{
        waitinglist.push(socket);
    }
  });


  // currently implemented a broadcast, after algo, this will become individual broadcast emit
  socket.on("msg",function(msg){
    // sender(username, id), to (username, id), message
    socket.broadcast.to(msg.to).emit("msg", msg.username + ' : ' + msg.message);
  });

  //disconnect
  socket.on('disconnect', function(){
    console.log(socket.username +' has disconnected' );
     if(typeof socket.partner.id === 'undefined') {
    }else{
        io.to(socket.partner.id).emit("pat_disc", {});
    }
    var index = waitinglist.indexOf(socket);
    if (index !== -1){
      waitinglist.splice(index, 1);
    }
    index = usernames.indexOf(socket.username);
    if (index !== -1){
      usernames.splice(index, 1);
    }
    count--;
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});