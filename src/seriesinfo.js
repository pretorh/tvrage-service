module.exports = {
    parse: parse
};

var xph = require("./xmlparsehelper");
const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parse(rawXmlString, callback) {
    process.nextTick(function() {
        xph.parseToNode(rawXmlString, "show", function(err, node) {
            if (err) {
                process.nextTick(function() {
                    callback(err);
                });
            } else {
                mapSeriesInfo(node, callback);
            }
        });
    });
}

function mapSeriesInfo(info, callback) {
    try {
        var result = xph.mapSimpleFields(info, ["name", "status", "started", "runtime"] );
        result.id = info["$"].id;
        var more = xph.mapSimpleFields(info, ["airtime", "latestepisode", "nextepisode"] );
        result.airtime = mapAirtime(more.airtime);
        result.latest = mapEpInfo(more.latestepisode);
        result.next = more.nextepisode ? mapEpInfo(more.nextepisode) : undefined;
        
        process.nextTick(function() {
            callback(null, result);
        });
    } catch (e) {
        process.nextTick(function() {
            callback(e);
        });
    }
}

function mapAirtime(airtime) {
    var splits = airtime.match(/^(.*) at (\d\d):(\d\d) ([ap]m)$/);
    return {
        day: dayOfWeek.indexOf(splits[1]),
        dayName: splits[1],
        time: parseInt(splits[2]) * 60 + parseInt(splits[3]) + (splits[4] == "am" ? 0 : 720),
        timeString: splits[2] + ":" + splits[3] + " " + splits[4]
    };
}

function mapEpInfo(episode) {
    var result = xph.mapSimpleFields(episode, ["title", {from: "airdate", to: "aired"}]);
    var splits = episode.number[0].match(/^(\d\d)x(\d\d)$/);
    result.season = parseInt(splits[1]);
    result.number = parseInt(splits[2]);
    return result;
}
