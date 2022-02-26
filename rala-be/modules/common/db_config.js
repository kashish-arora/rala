
var mysql = require('mysql');

var userConnections = {};

exports.getDBConnection = function(type, callback) {

    type = process.env.ACTIVE_DB ? process.env.ACTIVE_DB : type;

    if(type == "mongosync") {
        return getSyncMongoConnection();
    } else if (type == "mongo" && callback) {
        getMongoConnection(function(err, connection) {
            callback(err, connection);
        })
    } else if(type == "sql") {
        return getSQLConnection();
    } else {
        console.log("Could not connect to database due to missing database type");
        if(callback) callback("Invalid database type");
        else return null;
    }
}

getSQLConnection = function() {

    var user = process.env.DB_USER;
    var password = process.env.DB_PASSWORD;
    var database = process.env.DB_NAME;

    if(userConnections[database]) {
        
        var connection = userConnections[database];
        if(connection._closed) delete userConnections[database];
        
        connection.on('error', function(err) {
            console.log("Error connecting to database: " + err);
            if(err) delete userConnections[database];
        })

        if(userConnections[database]) {
            console.log("Getting a connection from pool for " + database);
            if(!user || !password || !database) console.log("Could not connect to database due to missing credentials");
            return connection;
        }
    } else {

        var options = {
            connectionLimit: 500,
            database: database,
            dialect: "mysql",
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            native: true,
            multipleStatements: true
        }

        var connection = mysql.createPool(options);
        console.log("Saving connection to pool for "+database);
        if(!user || !password || !database) console.log("Could not connect to database due to missing credentials");
        userConnections[connection.config.connectionConfig.database] = connection;

        connection.on('error', function(err) {
            console.log("The database ran into an error: " + err.message);
            handleDisconnection(options, database);
        })

        return connection;
    }

}

exports.getSQLConnection = getSQLConnection;


function handleDisconnection(options, database) {

    var connection = mysql.createPool(options);
    userConnections[connection.config.connectionConfig.database] = connection;

    connection.on('error', function(err) {
        console.log("The database ran into an error: " + err.message);
        handleDisconnection(options, database);
    })
}

getMongoConnection = function(callback) {


    var mongoClient = require("mongodb").MongoClient;

    var database = {
        user: process.env.MONGO_USER,
        pwd: process.env.MONGO_PASS,
        server: process.env.MONGO_SERVER,
        port: process.env.MONGO_PORT,
        name: process.env.MONGO_NAME
    }

    var url = `mongodb+srv://${database.user}:${database.pwd}@${database.server}/${database.name}?retryWrites=true&w=majority`;

    try {
        if(database && database.connection) {
            callback(null, database.connection);
        } else {
            mongoClient.connect(url, function(err, db) {
                if(err) callback(err);
                else {
                    database.connection = db.db(database.name);
                    callback(err, database.connection);
                }
            })
        }
    } catch(err) {
        callback(err);
    }

}

exports.getMongoConnection = getMongoConnection;

getSyncMongoConnection = function(callback) {

    var mongoClient = require("mongoskin");

    var database = {
        user: process.env.MONGO_USER,
        pwd: process.env.MONGO_PASS,
        server: process.env.MONGO_SERVER,
        port: process.env.MONGO_PORT,
        name: process.env.MONGO_NAME
    }

    var url = `mongodb+srv://${database.user}:${database.pwd}@${database.server}/myFirstDatabase?retryWrites=true&w=majority`;

    try {
        if(database && database.connection) {
            return database.connection;
        } else {
            database.connection = mongoClient.db(url, {native_parser: true});
            return database.connection;
        }
    } catch(err) {
        callback(err);
    }

}

exports.getSyncMongoConnection = getSyncMongoConnection;