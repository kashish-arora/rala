exports.updateName = function (req, res) {

    var input = req.body;

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

            if(user) {
                db.collection("users").updateOne({
                    user_id: user.user_id
                }, {
                    $set: {
                        name: input.name
                    }
                }, function(err) {
                    if(err) {
                        callback({
                            status: 500,
                            message: fixedData.errors.internal,
                            error: err.message
                        });
                    } else {
                        callback(null)
                    }
                })
            } else {
                callback({
                    status: 404,
                    message: fixedData.errors.notFound,
                    error: "No user found"
                });
            }


        }], function(err) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "User updated successfully"
                })
            }
        });
    
    })

}


exports.updateUserInfo = function (req, res) {

    var input = req.body;

    var update = {}

    if(input.bio) update.bio = input.bio;

    dbConfig.getDBConnection("mongo", function(err, db) {
        async.waterfall([function(callback) {

            db.collection("users").updateOne({
                user_id: req.session.user.info.user_id
            }, {
                $set: update
            }, function(err) {
                if(err) {
                    callback({
                        status: 500,
                        message: fixedData.errors.internal,
                        error: err.message
                    });
                } else {
                    callback(null);
                }
            })

        }, function(callback) {

            db.collection("users").findOne({
                user_id: req.session.user.info.user_id
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

        }], function(err, user) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "User updated successfully",
                    saved: true,
                    data: common.generateToken(user)
                })
            }
        });
    
    })

}


exports.getUserInfo = function(req, res) {

    var input = req.body;

    dbConfig.getDBConnection("mongo", function(err, db) {
        async.waterfall([function(callback) {

            db.collection("users").findOne({
                user_id: req.session.user.info.user_id
            }, {
                name: 1,
                email: 1
            }, function(err, user) {
                if(err) {
                    callback({
                        status: 500,
                        message: fixedData.errors.internal,
                        error: err.message
                    });
                } else {
                    callback(null, common.generateToken(user));
                }
            })

        }], function(err, user) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "User info fetched successfully",
                    data: user
                })
            }
        });
    
    })

}