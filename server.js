// set up ========================
var express = require('express');
var app = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var config = require('./config');
var Todo = require('./public/models/Todo');
var User = require('./public/models/User');
var jwt = require('jsonwebtoken');

// configuration =================
var port = process.env.PORT || 8585;
mongoose.connect(config.database);     // connect to mongoDB database on modulus.io

app.set('superSecret', config.secret);

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());                                     // parse application/json
app.use(methodOverride());


// routes ======================================================================

// api ----------------User------------------------------------------
var apiRouter = express.Router();

//create user
app.post('/api/user', function (req, res) {
    User.findOne({name: req.body.username}, function (err, user) {
        if (err) {
            res.send(err);
            return next();
        }
        if (user) {
            console.log(user);
            return res.status(409).send({message: 'Such user already exist'});
        } else {
            User.create({
                name: req.body.username,
                password: req.body.password,
                admin: true
            }, function (err, user) {
                if (err) {
                    res.send(err);
                }
                User.findOne({name: req.body.username}, function (err, user) {
                        if (err) {
                            res.send(err);
                        }
                        console.log("User is " + user);
                        var token = jwt.sign(user, app.get('superSecret'), {
                            // exp: 30 // expires in 24 hours
                        });

                        res.json({
                            _id: user._id,
                            username: user.name,
                            password: user.password,
                            token: token
                        })
                    }
                )
            });
        }
    });
});


apiRouter.get('/login', function (req, res) {
    User.findOne({
        name: req.headers.username
    }, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            res.status(403).send({
                success: false,
                message: 'User not found.'
            })
        } else if (user) {
            if (user.password != req.headers.password) {
                res.status(403).send({
                    success: false,
                    message: 'Wrong password'
                });
            } else {
                token = jwt.sign(user, app.get('superSecret'), {
                    // exp: 30 // expires in 24 hours
                });

                res.json({
                    _id: user._id,
                    username: user.name,
                    password: user.password,
                    token: token
                });
            }
        }
    });
});

apiRouter.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        });
    }
});

apiRouter.get('/', function (req, res) {
    res.json({message: 'Welcome to the coolest API on earth!'});
});


//=======================API TODOS====================
apiRouter.get('/todo', function (req, res) {
    console.log(req.body.token + ' ' + req.body._id);
    Todo.find(function (err, todos) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        res.json(todos);
    });
});

apiRouter.post('/todo', function (req, res) {
    var decoded;
    try {
        decoded = jwt.verify(req.body.token, app.get('superSecret'));
    } catch (ex) {
        return res.status(401).send({message: 'Unauthorized'});
    }

    Todo.create({
        text: req.body.text,
        belongsTo: decoded._doc._id
    }, function (err, todo) {
        if (err)
            res.send(err);

        Todo.find({
            belongsTo: decoded._doc._id
        }, function (err, todos) {
            if (err) {
                res.send(err);
            }
            res.json(todos);
        });
    });

});

apiRouter.delete('/todo/:todo_id', function (req, res) {
    var decoded;
    try {
        decoded = jwt.verify(req.body.token, app.get('superSecret'));
    } catch (ex) {
        return res.status(401).send({message: 'Unauthorized'});
    }
    Todo.findOne({
        _id: req.params.todo_id
    }, function (err, todo) {
        if (err)
            res.send(err);
        if (todo.belongsTo == decoded._doc._id) {
            Todo.remove({
                _id: todo.id
            })
        } else {
            return res.status(401).send({message: 'Unauthorized'});
        }

        Todo.find({
            belongsTo: decoded._doc._id
        }, function (err, todos) {
            if (err) {
                res.send(err);
            }
            res.json(todos);
        });
    });
    //============================================================
    Todo.remove({
        _id: req.params.todo_id
    }, function (err, todo) {
        if (err)
            res.send(err);

        Todo.find({
            belongsTo: decoded._doc._id
        }, function (err, todos) {
            if (err) {
                res.send(err);
            }
            res.json(todos);
        });
    });
});

apiRouter.get('/todo/:owner_id', function (req, res) {
    console.log("Owner ID is " + req.params.owner_id);
    Todo.find({
        belongsTo: req.params.owner_id
    }, function (err, todo) {
        if (err) {
            res.send(err);
        }
        res.json(todo);
    });
});

app.use('/api', apiRouter);

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendfile('./public/view/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

