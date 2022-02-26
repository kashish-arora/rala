exports.getMyLists = function(req, res) {

    dbConfig.getDBConnection("mongo", function(err, db) {
        async.waterfall([function(callback) {

            db.collection("playlists").find({
                user_id: req.session.user.info.user_id
            }).project({ playlist_id: 1, name: 1, songs: 1, _id: 0 }).toArray(function(err, rows) {
                if(err) {
                    callback({
                        status: 500,
                        message: fixedData.errors.internal,
                        error: err.message
                    });
                } else {
                    callback(null, rows);
                }
            })

        }], function(err, lists) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "Playlists fetched successfully",
                    data: lists
                })
            }
        });
    
    })

}


exports.createNewList = function(req, res) {

    var input = req.body;

    if(input.name == "" || !input.name) input.name = "Unnamed list";

    dbConfig.getDBConnection("mongo", function(err, db) {
        async.waterfall([function(callback) {

            var newPlaylist = {
                playlist_id: common.getRandomUniqueId("list"),
                user_id: req.session.user.info.user_id,
                name: input.name,
                timestamp: moment().format(),
                last_updated: moment().format(),
                songs: input.songs
            }

            db.collection("playlists").insertOne(newPlaylist, function(err) {
                if(err) {
                    callback({
                        status: 500,
                        message: fixedData.errors.internal,
                        error: err.message
                    });
                } else {
                    callback(null, _.pick(newPlaylist, ['playlist_id', 'name', 'songs']));
                }
            })

        }], function(err, newPlaylist) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "Playlist created",
                    playlist: newPlaylist
                })
            }
        });
    
    })

}

exports.updateList = function(req, res) {

    var input = req.body;

    if(input.name == "" || !input.name) input.name = "Unnamed list";

    dbConfig.getDBConnection("mongo", function(err, db) {
        async.waterfall([function(callback) {

            db.collection("playlists").updateOne({
                playlist_id: input.playlist_id,
                user_id: req.session.user.info.user_id
            }, {
                name: input.name,
                last_updated: moment().format(),
                songs: input.songs
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

        }], function(err) {
            if(err){
                req.err = err;
                errorHandler.handle(req, res);
            } else {
                res.status(200);
                res.json({
                    status: 200,           
                    message: "Playlist created"
                })
            }
        });
    
    })

}