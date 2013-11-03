module.exports = {
    parse: parse,
    apiName: "episode_list",
    queryObject: function(seriesId) {
        return {
            sid: seriesId
        };
    }
};

var xph = require("./xmlparsehelper");

function parse(rawXmlString, callback) {
    process.nextTick(function() {
        xph.parseToNode(rawXmlString, "Show.Episodelist.0.Season", function(err, node) {
            if (err) {
                process.nextTick(function() {
                    callback(err);
                });
            } else {
                mapEps(node, callback);
            }
        });
    });
}

function mapEps(seasons, callback) {
    try {
        var result = [];
        for (var i = 0; i < seasons.length; ++i) {
            result[i] = mapSeason(seasons[i]);
        }
        callback(null, result);
    } catch (e) {
        callback(e);
    }
}

function mapSeason(season) {
    var list = [];
    for (var i = 0; i < season.episode.length; ++i) {
        list[i] = mapEpisode(season.episode[i]);
    }
    
    return {
        number: season["$"].no,
        list: list
    };
}

function mapEpisode(episode) {
    var result = xph.mapSimpleFields(episode, [
        {from: "airdate", to: "aired"}, "link", "title"]);
    result.index = xph.mapSimpleFields(episode, [
        {from: "epnum", to: "overall"},
        {from: "seasonnum", to: "season"}]);
    return result;
}
