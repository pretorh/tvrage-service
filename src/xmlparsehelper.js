module.exports.parseToNode = parseToNode;
module.exports.mapSimpleFields = map;

var xml2js = require("xml2js");

function parseToNode(xml, xpath, errPath, callback) {
    if (arguments.length == 3 && typeof(errPath) == "function") {
        callback = errPath;
        errPath = {
            path: "xxxxxxxx",
            message: ""
        };
    }

    xml2js.parseString(xml, function(err, obj) {
        if (err) {
            process.nextTick(function() {
                callback(err);
            });
        } else {
            process.nextTick(function() {
                var errobj = findXpath(obj, errPath.path.split("."));
                if (!errobj.err && errobj.obj) {
                    // error object found
                    errobj.err = {
                        message: errPath.message,
                        data: errobj.obj
                    };
                    callback(errobj.err);
                } else {
                    var res = findXpath(obj, xpath.split("."));
                    callback(res.err, res.obj);
                }
            });
        }
    });
}

function findXpath(obj, path, callback) {
    var item = path.shift();
    if (item) {
        if (obj[item]) {
            return findXpath(obj[item], path, callback);
        } else {
            return {
                err: {
                    error: "root not found",
                    detailed: "expected '" + item + "' in " + JSON.stringify(obj)
                }};
        }
    } else {
        return {
            err: null,
            obj: obj
        };
    }
}

function map(xml, fields) {
    var result = {};
    for (var i = 0; i < fields.length; ++i) {
        var f = fields[i];
        if (f.from && f.to) {
            result[f.to] = xml && xml[f.from] ? xml[f.from][0] : undefined;
        } else {
            result[f] = xml && xml[f] ? xml[f][0] : undefined;
        }
    }
    return result;
}
