require('dotenv').config({path: __dirname + '/.env'});

const express=require('express'),
    session=require('express-session'),
    cors=require('cors'),
    auth_routes=require('./routing/auth'),
    profile_routes=require('./routing/profile'),
    app_routes=require('./routing/app');

global.http = require("http");
global.common = require("./modules/common/services");
global.dbConfig = require("./modules/common/db_config");
global.fixedData = require("./fixed/index");
global.errorHandler = require("./modules/common/error_handler");
global.async = require('async');
global.fs = require('fs');
global.path = require('path');
global.moment = require('moment');
global._ = require('underscore');

const port=process.env.PORT || 5000

const app=express();
app.use(express.json());
app.set('port', '3000');
app.use(express.urlencoded({extended:true,limit:'50mb'}));
app.set("view engine", "ejs");
app.use(cors());
app.use(session({
    secret: fixedData.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    /*cookie: {
        secure: true,
    }*/
}));

//Routes
app.use('/auth',auth_routes);
app.use('/user',profile_routes);
app.use('/app', app_routes);

const server=app.listen(port,()=>{
    console.log(`Server is listening on ${server.address().port}`)
})