function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    })
}

/****JWT */

define("JWT_KEY", "opxb8SqxKOoGmjUnUx2b");
define("JWT_EXPIRY", "30 days");
define("JWT_RESET_KEY", "3Xgfo6cIH4BhzZ8ye2xt");
define("JWT_RESET_EXPIRY", "30 minutes");


define("SESSION_SECRET", "Ttd4n09PxtOMgJvu7ddx");


/****Errors */

define("errors", {
    badRequest: "Bad Request",
    internal: "Something went wrong",
    partiallyOK: "Partially Okay",
    unauthenticated: "User not authenticated",
    notFound: "Not found"
});

define("resetClientEndpoint", "");
