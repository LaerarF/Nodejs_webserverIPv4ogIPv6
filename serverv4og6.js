//Litt info: dette er eit læreingsprosjekt basert på litt mikking og makking. Mål å læra node.js og github kankje :)


var http = require('http').createServer(handler); //Bruk http server og  funksjons behandler()
var fs = require('fs'); //ta med  filesystem modulen
var io = require('socket.io')(http) //bruk  socket.io moduleo og bruk http objekt (server)
var Gpio = require('onoff').Gpio; //inkluder onoff for aa bruka  GPIO
var LED = new Gpio(4, 'out'); //bruk  GPIO pin 4 som output
var pushButton = new Gpio(17, 'in', 'both'); //bruk  GPIO pin 17 som  input, og både  knappp pressa inn og sluppet  skal handles

http.listen(8081, "::"); //lytt på port 8081 på alle IPv6 adresser

function handler (req, res) { //lag server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //les  fila index.html i public mappa
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //vis  404 ved feil
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //skriv  HTML
    res.write(data); //skriv  data fra index.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) {// WebSocket forbindelse
  var lightvalue = 0; //staisk variabel for nåverande status
  pushButton.watch(function (err, value) { //overvåk om knappen blir trykka inn
    if (err) { //ved feil
      console.error('There was an error', err); //skriv feil til  console
      return;
    }
    lightvalue = value;
    socket.emit('light', lightvalue); //send status på knappen til klient
  });
  socket.on('light', function(data) { //hent status på knappen frå klient
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //berre endre lys om status er endra
      LED.writeSync(lightvalue); //Skru LED av og på
    }
  });
});

process.on('SIGINT', function () { //ved ctrl+c
  LED.writeSync(0); // Skru LED av
  LED.unexport(); // frigjer ressursar
  pushButton.unexport(); // frigjer ressursar
  process.exit(); //avslutt alt
});
