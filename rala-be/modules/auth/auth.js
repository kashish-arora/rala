exports.checkLogin = function(req, res) {
    
    var input = req.body;

    common.isValidToken(input.token, function(err, data) {
        if(err || !data) {
            res.status(401);
            res.json({
                status: 401,
                message: fixedData.errors.unauthenticated,
                authenticated: false
            });
        } else {
            res.status(200);
            res.json({
                status: 200,
                message: "User authenticated",
                authenticated: true
            });
        }
    })
}

exports.requestOTP = function (req, res) {

    var input = req.query;

    dbConfig.getDBConnection("mongo", function(err, db) {
        async.waterfall([function(callback) {

            db.collection("users").findOne({
                email: input.email
            }, function(err, user) {
                if(err) {
                    callback({
                        status: 500,
                        message: fixedData.errors.internal,
                        error: err.message
                    });
                } else {
                    callback(null, user);
                }
            })

        }, function(user, callback) {

            var otp = Math.floor(1000 + Math.random() * 9000).toString();

            if(user) {
                db.collection("users").updateOne({
                    user_id: user.user_id
                }, {
                    $set: {
                        email_otp: otp,
                        email_otp_timestamp: moment().format()
                    }
                }, function(err) {
                    if(err) {
                        callback({
                            status: 500,
                            message: fixedData.errors.internal,
                            error: err.message
                        });
                    } else {
                        callback(null, otp, false)
                    }
                })
            } else {

                user = {};
                user.email = input.email;
                user.user_id = common.getRandomUniqueId("user");
                user.email_otp = otp;
                user.email_otp_timestamp = moment().format();

                db.collection("users").insertOne(user, function(err) {
                    if(err) {
                        callback({
                            status: 500,
                            message: fixedData.errors.internal,
                            error: err.message
                        });
                    } else {
                        callback(null, otp, true)
                    }
                })
            }


        }, function(otp, newUser, callback) {

            var emailTemplate = fs.readFileSync(path.join(__dirname + '../../../templates/otpEmail.html'), "utf-8");
            
            for(var digit in otp) {
                emailTemplate = emailTemplate.replace("[otp" + digit + "]", otp[digit]);
            }
            
            var data = {
                from:  process.env.MAIL_USERNAME,
                to: input.email,
                subject: `Login OTP - Rala`,
                html: emailTemplate
            }

            common.sendMail(data);
            callback(null, newUser);

        }], function(err, newUser) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "OTP sent successfully",
                    newUser: newUser
                })
            }
        });
    
    })

}


exports.verifyOTP = function (req, res) {

    var input = req.body;

    async.waterfall([function(callback) {

        dbConfig.getDBConnection("mongo", function(err, db) {

            db.collection("users").findOne({email: input.email}, function(err, user) {
                if(!user) {
                    callback("err");
                } else if(user.email_otp && input.otp != user.email_otp) {
                    callback("err");
                } else {
                    var token = common.generateToken(user);
                    callback(null, token);
                }
            })

        })

    }], function(err, token) {
        if(err){
            req.err = err;
            errorHandler.handle(req, res);
        } else {
            res.status(200);
            res.json({
                status: 200,           
                message: "Logged in successfully",
                token: token
            })
        }
    });


}

exports.authenticateJWT = function(req, res, next) {
    
    common.isValidToken(req.headers["token"], function(err, data) {
        if(err) {
            req.err = {
                status: 401,
                message: fixedData.errors.unauthenticated,
                error: "User token invalid or expired"
            }
            errorHandler.handle(req, res);
        } else {
            if(!req.session) req.session = {};

            var userSession = {
                info: {}
            };

            Object.keys(data).map(function(key) {
                userSession.info[key] = data[key];
            })

            req.session.user = userSession;

            next();
        }
    })
}