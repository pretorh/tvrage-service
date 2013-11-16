#!/usr/bin/node

if (process.argv.length < 2 || isNaN(process.argv[2])) {
    console.log("first argument must be the port number");
    return;
}

var tvrage = require("../");
tvrage.startServer(process.argv[2]);
