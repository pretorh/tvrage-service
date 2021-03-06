module.exports = {
    parse: parse,
    apiName: "search",
    queryObject: function(series) {
        return {
            show: series
        };
    }
};

var xph = require("./xmlparsehelper");

function parse(rawXmlString, callback) {
    process.nextTick(function() {
        xph.parseToNode(rawXmlString, "Results.show", {
                path: "Results.0",
                message: "series not found",
                httpErr: 404
            }, function(err, node) {
                if (err) {
                    process.nextTick(function() {
                        callback(err);
                    });
                } else {
                    mapShows(node, callback);
                }
            });
    });
}

function mapShows(shows, callback) {
    try {
        var result = [];
        for (var i = 0; i < shows.length; ++i) {
            result[i] = xph.mapSimpleFields(shows[i], [
                {from: "showid", to: "id"}, "name", "link", "started", "ended", "seasons"] );
            result[i].ended = result[i].ended === "0" ? null : parseInt(result[i].ended);
            result[i].genres = mapGenres(shows[i]);
        }

        process.nextTick(function() {
            callback(null, result);
        });
    } catch (e) {
        process.nextTick(function() {
            callback(e);
        });
    }
}

function mapGenres(show) {
    if (show.genres[0] === "") return [];

    var result = [];
    for (var i = 0; i < show.genres[0].genre.length; ++i) {
        result[i] = show.genres[0].genre[i];
    }
    return result;
}
