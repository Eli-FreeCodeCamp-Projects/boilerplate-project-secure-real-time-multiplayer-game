require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const cors = require('cors');
const http = require('http');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const gameRoutes = require('./routes/game.js');
const helmet = require('helmet');

const app = express();

const httpServer = http.createServer(app);
const io = new socket.Server(httpServer);

//-> Set up helmet
app.use(helmet({
  frameguard: {         // configure
    action: 'deny'
  },
  xPoweredBy: false,
  contentSecurityPolicy: {    // enable and configure
    directives: {
      defaultSrc: ["'none'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'"],
      FormAction: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
      connectSrc: ["'self'"],
    }
  },
  dnsPrefetchControl: { allow: false },     // disable,
  xFrameOptions: { action: "sameorigin" },
  strictTransportSecurity: {
    includeSubDomains: true,
    force: true,
  },
  referrerPolicy:{
    policy: "same-origin"
  }
}));

//-> Set headers
app.use(function (req, res, next) {
  res.setHeader('X-Powered-By', 'PHP 7.4.3')
  res.setHeader('surrogate-control', 'no-store')
  res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('pragma', 'no-cache')
  res.setHeader('expires', '0')
  next()
})

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);

// Game socket routes
gameRoutes(io);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = httpServer.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
