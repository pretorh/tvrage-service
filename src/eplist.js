module.exports = {
    parse: function(xml, callback) {
        process.nextTick(function() {
            if (!(xml && xml.Show && xml.Show.Episodelist && xml.Show.Episodelist[0])) {
                callback({
                    error: "malformed xml",
                    detail: "expected xml.Show.Episodelist[0], got: " + JSON.stringify(xml)
                });
            } else {
                mapEps(xml.Show.Episodelist[0].Season, callback);
            }
        });
    }
};

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
    return {
        index: {
            overall: episode.epnum[0],
            season: episode.seasonnum[0],
        },
        aired: episode.airdate[0],
        link: episode.link[0],
        title: episode.title[0]
    };
}
