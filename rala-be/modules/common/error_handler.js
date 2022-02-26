const { v4: uuid } = require('uuid')

exports.handle = function(req,res) {

    var err = req.err;

    if(!err.status) {
        err.status = 500;
        err.message = fixedData.internal;
    }

    if(err.status == 500) { 
        if(req.session && req.session.user && req.session.user.info.user_id) {
            var user_id = req.session.user.info.user_id;
        } else var user_id = null;

        err.api = req.originalUrl;
        
        logError(err, user_id);
    }
    
    if(res && !req.noResponse) {
        res.status(err.status);
        res.json({
            status: err.status,
            message: err.message,
            error: err.error,
            api: req.originalUrl
        })
    }

}

logError = function(err, user_id) {
    var connection = dbConfig.getDBConnection("mongo", function(error, db) {
        if(error) {
            console.log("Encountered an error which couldn't be logged to the database");
        } else {
            db.collection("errors").insertOne({
                id: uuid(),
                error: err.error,
                user_id: user_id,
                meta: err,
                timestamp: moment().format()
            }, function(error) {
                if(error) console.log("Encountered an error which couldn't be logged to the database");
            })
        }
    });
}