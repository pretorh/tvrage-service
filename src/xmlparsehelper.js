module.exports.parseToNode = parseToNode;
module.exports.mapSimpleFields = map;

var xml2js = require("xml2js");

function parseToNode(xml, xpath, callback) {
    xml2js.parseString(xml, function(err, obj) {
        if (err) {
            process.nextTick(function() {
                callback(err);
            });
        } else {
            process.nextTick(function() {
                findXpath(obj, xpath.split("."), callback);
            });
        }
    });
}

function findXpath(obj, path, callback) {
    var item = path.shift();
    if (item) {
        if (obj[item]) {
            findXpath(obj[item], path, callback);
        } else {
            process.nextTick(function() {
                callback({
                    error: "root not found",
                    detailed: "expected '" + item + "' in " + JSON.stringify(obj)
                });
            });
        }
    } else {
        process.nextTick(function() {
            callback(null, obj);
        });
    }
}

function map(xml, fields) {
    var result = {};
    for (var i = 0; i < fields.length; ++i) {
        if (fields[i].from && fields[i].to) {
            result[fields[i].to] = xml[fields[i].from][0];
        } else {
            result[fields[i]] = xml[fields[i]][0];
        }
    }
    return result;
}