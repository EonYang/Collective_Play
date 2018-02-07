// create variable to hold all users and users' status.
// format : dogs[id] = {name: xxx, time: yyy}
let dogs = {};

dogs = {
  'zenMaster':{
    name : 'Zen Master',
    timeStart : 1517697837631,
  }
}

// dogs['testDog1'] = {
//   name: 'test Dog 1',
//   timeStart: 1517697837631,
// };
//
// dogs['testDog2'] = {
//   name: 'test Dog 2',
//   timeStart: 1517696837231,
// };

// create basic objects
let port = process.env.PORT || 8300;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function() {
  console.log('server is listening at port: ' + port);
});

app.use(express.static('public'));

let io = require('socket.io').listen(server);


var outputs = io.of('/');

// what do outputs do
// nothing but print logs

outputs.on('connection', function(socket) {
  console.log('new output client connected: ' + socket.id);

  socket.on('askingData', function() {
    outputs.emit('initialData', dogs);
    console.log('just gave all dogs to a new output client');
  })

  socket.on('disconnect', function() {
    console.log('output client is gone: ' + socket.id);
  });
});

var inputs = io.of('/input');

//what do inputs do
inputs.on('connection', function(socket) {
  console.log('new input client connected: ' + socket.id);

  //when we have userName, store it as a user.
  socket.on('newUser', function(nameAndStartTime) {
    dogs[socket.id] = {
      name: nameAndStartTime.name,
      timeStart: nameAndStartTime.startTime,
    }
    // create new variable to hold new dog, so we can only sent new dog to others.
    let newDog = {
      id: socket.id,
      name: nameAndStartTime.name,
      timeStart: nameAndStartTime.startTime,
    }
    //send new dog message to all clients
    outputs.emit('newDog', newDog);
    console.log('giving new dog to all outputs, line 58');
  });

  //when we got a new userStartTime(means a user moved his phone),
  //store it to the corresponding userID
  socket.on('zenInterupted', function(userStartTime) {
    //if user does't have a name, skip this.
    if (dogs[socket.id] != null && dogs[socket.id].name != null) {
      // refresh dogs, and emit new data to all
      dogs[socket.id].timeStart = userStartTime;
      let failedDogId = socket.id;
      // tell outpus who just faild, for animation purpose.
      outputs.emit('dogFail', failedDogId);
      console.log('User' + dogs[socket.id].name + 'just failed');
    }
  });

  // when user leave
  socket.on('disconnect', function() {
    //if user does't have a name, skip this.
    if (dogs[socket.id] != null && dogs[socket.id].name != null) {
      let goneDogId = socket.id;
      let dogName = dogs[socket.id].name;
      //delete this dog
      delete dogs[socket.id];
      //tell outputs who just left
      outputs.emit('dogLeft', goneDogId);
      console.log('this guy has left:' + dogName);
    } else {
      console.log('this guy has left:' + socket.id);
    }
  })
});
