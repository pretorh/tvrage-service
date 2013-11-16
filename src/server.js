module.exports = function(port) {
    return new Server(port);
}

var http = require("http"),
    querystring = require("querystring"),
    tvrage = require("./tvrage");

function Server(port) {
    var self = this;
    var server = http.createServer(requestHandler);
    server.listen(port);

    function requestHandler(req, res) {
        console.log("%s %s", req.method, req.url);
        if (req.method === "GET") {
            var url;
            if (url = matchUrl(req, /^\/search\/(.*)$/)) search(url, res);
            else if (url = matchUrl(req, /^\/list\/(\d+)$/)) epList(url, res);
            else if (url = matchUrl(req, /^\/series\/(\d+)$/)) series(url, res);
            else if (url = matchUrl(req, /^\/find\/(.+)\/(\d+)\/(\d+(,\d+)*)$/)) find(url, res);
            else {
                writeResponse(res, 404, "method not found: " + req.url);
            }
        } else {
            writeResponse(res, 400, "bad method: " + req.method);
        }
    }

    function search(url, res) {
        console.log("search %s", url[0]);
        tvrage.search(url[0], createCallback(res));
    }

    function epList(url, res) {
        console.log("get ep list %d", url[0]);
        tvrage.getEpisodeList(parseInt(url[0]), createCallback(res));
    }

    function series(url, res) {
        console.log("series details %d", url[0]);
        tvrage.getSeriesDetails(parseInt(url[0]), createCallback(res));
    }

    function find(url, res) {
        var query = {
            series: url[0],
            season: parseInt(url[1]),
            episodes: url[2].split(",")
        };
        console.log("episode match: %s", JSON.stringify(query));
        tvrage.getEpisode(query, createCallback(res));
    }

    function createCallback(res) {
        return function(err, data) {
            if (err) {
                writeResponse(res, 500, "internal error");
                console.log(err);
                if (err && err.buffer) {
                    console.log(err.buffer.toString());
                }
            } else {
                writeResponse(res, 200, data);
            }
        }
    }

    function matchUrl(req, regex) {
        var url = req.url.match(regex);
        if (url) {
            url = url.slice(1);
            for (var i = 0; i < url.length; ++i) {
                if (url[i]) {
                    url[i] = querystring.unescape(url[i]);
                }
            }
            return url;
        } else {
            return url;
        }
    }

    function writeResponse(response, status, data) {
        response.writeHead(status, {
            "Content-Type": "application/json"
        });
        response.end(JSON.stringify(data));
        console.log("sent");
    }

}
