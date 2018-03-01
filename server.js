/*
       Copyright 2018 IBM Corp All Rights Reserved

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var session = require('express-session')

var tokenGen = require('./jwt/token')

var passport = require('passport');

var axios = require('axios');

console.log(process.env);
var client_id = process.env.OIDC_ID;
var client_secret = process.env.OIDC_SECRET;
var authorization_url = process.env.OIDC_AUTH;
var token_url = process.env.OIDC_TOKEN;
var issuer_id = process.env.OIDC_ISSUER;

const PORTFOLIO_SERVICE_URL = "http://portfolio-service:9080/portfolio"

//TODO this needs to become a kube environment variable or secret
var callback_url = 'https://'+process.env.PROXY_HOST+'/tradr/auth/sso/callback';

var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
var Strategy = new OpenIDConnectStrategy({
        authorizationURL: authorization_url,
        tokenURL: token_url,
        clientID: client_id,
        scope: 'email',
        response_type: 'code',
        clientSecret: client_secret,
        callbackURL: callback_url,
        skipUserProfile: true,
        issuer: issuer_id,
        addCACert: true,
        CACertPathList: ['/certs/blueid-root.crt', '/certs/blueid-intermediate.crt', '/certs/blueid-server.crt', '/certs/prepiam.toronto.ca.ibm.com.pem', '/certs/idaas.iam.ibm.com.pem']
    },
    function (iss, sub, profile, accessToken, refreshToken, params, done) {
        process.nextTick(function () {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            done(null, profile);
        });
    })

passport.use(Strategy);

var app = express();

// view engine setup
app.set('view engine', 'jade')
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'keyboard cat', cookie: {maxAge: 60000}}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/tradr/auth/sso/callback', function (req, res, next) {
    var redirect_url = req.session.originalUrl;
    // var redirect_url = '/#/';
    console.log(req.session);
    //console.log(req.session.passport.user.accessToken);
    passport.authenticate('openidconnect', {
        successRedirect: redirect_url,
        failureRedirect: '/failure',
    })(req, res, next);
});

app.get('/tradr/failure', function (req, res) {
    console.log('login failed');
    // res.send('login failed');
});

app.get('/tradr/user', function (req, res) {
    res.send({token: tokenGen.generateAccessToken(req.session.passport.user._json), session: req.session.passport});
    //res.send(req.session.passport);
});

app.get('/portfolio', function (req, res) {
    const headers = req.get("Authorization");
    axios
        .get(PORTFOLIO_SERVICE_URL, {headers: req.headers})
        .then(response => {
            console.log("portfolio data received:");
            console.log(response.data);
            res.send(response);
        });

});

app.get('/portfolio/:user', function (req, res) {
    const user = req.params.user;
    console.log("getting portfolio for user: "+user)
    console.log(req.params);
    axios.get(PORTFOLIO_SERVICE_URL + "/" + user, {headers: req.headers})
        .then(response => {
            console.log(response.data);
            res.send(response.data);
        });
});

app.post('/portfolio/:user', function (req, res) {
    const user = req.params.user;
    console.log("creating portfolio for user: "+user)
    axios.post(PORTFOLIO_SERVICE_URL + "/" + user, {headers: req.headers})
        .then(response => {
            console.log(response.data);
            res.send(response.data);
        }.catch(error=> {
            console.log(error.response);
            res.send({ error });
        });
});

app.put('/portfolio/:user', function (req, res) {
    const user = req.params.user;
    console.log("Updating portfolio for user: "+user)
    const params = req.params;
    console.log("parameters are: "+req.params);

    axios.get(PORTFOLIO_SERVICE_URL + "/" + user, {headers: req.headers, params:params})
        .then(response => {
            console.log(response.data);
            res.send(response.data);
});

});

app.delete('/portfolio/:user', function (req, res) {
    const user = req.params.user;
    console.log("Deleting portfolio for user: "+user)
    const params = req.params;
    console.log("parameters are: "+req.params);
    axios.delete(PORTFOLIO_SERVICE_URL + "/" + user, {headers: req.headers})
        .then(response => {
        console.log(response.data);
        res.send(response.data);
});

});


app.get('/tradr/login', passport.authenticate('openidconnect', {}));

app.all('*', function (req, res, next) {
    ensureAuthenticated(req, res, next);
});
//app.use(express.static(path.join(__dirname, 'dist')));

app.use('/tradr', express.static(path.join(__dirname, 'dist')));

// Allow CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


/***************************************************************/

// Authentication


function ensureAuthenticated(req, res, next) {
    console.log(req.session);
    if (!req.isAuthenticated()) {
        console.log('user not authenticated, logging in')
        req.session.originalUrl = req.originalUrl;
        res.redirect('/tradr/login');
    } else {
        console.log("user is authenticated");
        return next();
    }
}

app.get('/tradr/hello', ensureAuthenticated, function (req, res) {
    console.log(req.session.passport.user.accessToken);
    res.send('Hello, ' + req.user['id'] + '!');
});

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
// Done Authenticating
/***************************************************************/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log({
        message: err.message,
        error: {}
    });
});


module.exports = app;