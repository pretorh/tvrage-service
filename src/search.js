module.exports = {
    parse: function(xml, callback) {
        process.nextTick(function() {
            if (!(xml && xml.Results && xml.Results.show)) {
                callback({
                    error: "malformed xml",
                    detail: "expected xml.Results.show, got: " + JSON.stringify(xml)
                });
            } else {
                mapShows(xml.Results.show, callback);
            }
        });
    }
};

function mapShows(shows, callback) {
    try {
        var result = [];
        for (var i = 0; i < shows.length; ++i) {
            var ended = shows[i].ended[0];
            result[i] = {
                id: shows[i].showid[0],
                name: shows[i].name[0],
                link: shows[i].link[0],
                started: shows[i].started[0],
                ended: ended === "0" ? null : parseInt(ended),
                seasons: shows[i].seasons[0],
                genres: mapGenres(shows[i])
            };
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
    var result = [];
    for (var i = 0; i < show.genres[0].genre.length; ++i) {
        result[i] = show.genres[0].genre[i];
    }
    return result;
}
