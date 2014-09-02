var express        = require('express');
var session        = require('express-session')
var path           = require('path');
var favicon        = require('static-favicon');
var bodyParser     = require('body-parser');
var db             = require('./models');
var cookieParser = require('cookie-parser');
var sessionstore = require('sessionstore');

var routes = require('./routes/cis-router');

var app          = express();
app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser())
app.use(session({secret: 'cis secret', resave:true, saveUninitialized:true, store:sessionstore.createSessionStore()}))
app.use('/', routes);

process.on('uncaughtException', function (err) {
    console.error(err);
});

exports = module.exports = app;

