var vows = require("vows"),
    assert = require("assert"),
    values = require("./value-asserts"),

    fs = require("fs"),

    tvrage = require("../");

function GetXmlMock(resultFile, cacheValue) {
    var self = this;
    self.calls = [];
    self.getCacheCalls = [];
    self.saveCacheCalls = [];

    self.get = function(url, callback) {
        self.calls.push(url);
        fs.readFile("./test/data/" + resultFile, {encoding: "utf-8"}, callback);
    }
    self.getOptions = function() {
        return {
            get: self.get,
            cache: self.getCache,
            save: self.saveCache
        };
    }
    self.getCache = function(key, callback) {
        self.getCacheCalls.push(key);
        callback(cacheValue);
    }
    self.saveCache = function(key, value) {
        self.saveCacheCalls.push({k: key, v:value});
    }
}

function getMultiMock(url, callback) {
    if (url === "http://services.tvrage.com/feeds/search.php?show=modern%20family") {
        fs.readFile("./test/data/search.xml", callback);
    } else if (url === "http://services.tvrage.com/feeds/episode_list.php?sid=22622") {
        fs.readFile("./test/data/episode_list.xml", callback);
    } else {
        callback(new Error("not implemented for url: " + url));
    }
}

vows.describe("http test").addBatch({
    "when searching for a series": {
        topic: function(mock) {
            var cb = this.callback;
            var mock = new GetXmlMock("search.xml");
            tvrage.search("series name", mock.getOptions(), function(err, result) {
                cb(err, {
                    mock: mock,
                    result: result
                });
            });
        },
        "the get xml over http function got called once with url=*...search.php...*": function(err, res) {
            assert.equal(res.mock.calls.length, 1);
            assert.equal(res.mock.calls[0], "http://services.tvrage.com/feeds/search.php?show=series%20name");
        },
        "no error occured": function(err, res) {
            assert.isNull(err);
        },
        "the result is an array": function(err, res) {
            assert.isNotNull(res);
            assert.isNotNull(res.result);
            assert.isArray(res.result);
        },
        "the first entry of the result is *Modern Family*": function(err, res) {
            values.isModernFamily(res.result[0]);
        },
        "the cache get function is called *once*": function(err, result) {
            assert.equal(result.mock.getCacheCalls.length, 1);
        },
        "the cache get function is called with *search...* key": function(err, result) {
            assert.equal(result.mock.getCacheCalls[0], "search:show=series%20name");
        },
        "the cache save function is called *once*": function(err, result) {
            assert.equal(result.mock.saveCacheCalls.length, 1);
        },
        "the cache save function is called with *search...* key and the result as the value": function(err, result) {
            assert.equal(result.mock.saveCacheCalls[0].k, "search:show=series%20name");
            assert.equal(result.mock.saveCacheCalls[0].v, result.result);
        }
    },

    "when listing a series' episodes": {
        topic: function(mock) {
            var cb = this.callback;
            var mock = new GetXmlMock("episode_list.xml");
            tvrage.getEpisodeList(22622, mock.getOptions(), function(err, result) {
                cb(err, {
                    mock: mock,
                    result: result
                });
            });
        },
        "the get xml over http function got called once with url=*...episode_list.php...*": function(err, res) {
            assert.equal(res.mock.calls.length, 1);
            assert.equal(res.mock.calls[0], "http://services.tvrage.com/feeds/episode_list.php?sid=22622");
        },
        "no error occured": function(err, res) {
            assert.isNull(err);
        },
        "the result is an array": function(err, res) {
            assert.isNotNull(res);
            assert.isNotNull(res.result);
            assert.isArray(res.result);
        },
        "the *first episode* of the *first season* is *Pilot*": function(err, res) {
            assert.isNotNull(res.result[0]);
            assert.isNotNull(res.result[0].list);
            assert.isNotNull(res.result[0].list[0]);
            values.isPilot(res.result[0].list[0]);
        },
        "the *second episode* of the *second season* is *The Kill*": function(err, res) {
            assert.isNotNull(res.result[1]);
            assert.isNotNull(res.result[1].list);
            assert.isNotNull(res.result[1].list[1]);
            values.isTheKiss(res.result[1].list[1]);
        }
    },

    "when getting a series' details": {
        topic: function(mock) {
            var cb = this.callback;
            var mock = new GetXmlMock("episodeinfo.xml");
            tvrage.getSeriesDetails(22622, mock.getOptions(), function(err, result) {
                cb(err, {
                    mock: mock,
                    result: result
                });
            });
        },
        "the get xml over http function got called once with url=*...episodeinfo.php...*": function(err, res) {
            assert.equal(res.mock.calls.length, 1);
            assert.equal(res.mock.calls[0], "http://services.tvrage.com/feeds/episodeinfo.php?sid=22622");
        },
        "no error occured": function(err, res) {
            assert.isNull(err);
        },
        "the result is an object": function(err, res) {
            assert.isNotNull(res);
            assert.isNotNull(res.result);
            assert.isObject(res.result);
        },
        "the result has details for *Modern Family*": function(err, res) {
            values.hasModernFamilyDetails(res.result);
            values.hasModernFamilyAirtime(res.result);
            values.hasModernFamilyLatestEp(res.result);
            values.hasModernFamilyNextEp(res.result);
        }
    },

    "when a value is returned from the cache": {
        topic: function() {
            var cb = this.callback;
            var mock = new GetXmlMock("search.xml", "some cached value");
            tvrage.search("series name", mock.getOptions(), function(err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, {
                        result: result,
                        mock: mock
                    });
                }
            });
        },
        "the cache get function is called *once*": function(err, result) {
            assert.equal(result.mock.getCacheCalls.length, 1);
        },
        "the cache save function is *not* called": function(err, result) {
            assert.equal(result.mock.saveCacheCalls.length, 0);
        },
        "the get function is *not* called": function(err, result) {
            assert.equal(result.mock.calls.length, 0);
        },
        "the cached value is returned": function(err, result) {
            assert.equal(result.result, "some cached value");
        }
    },

    "when getting an episodes details": {
        topic: function() {
            var query = {
                series: "modern family",
                season: 2,
                episodes: ["01", "02"]
            };
            tvrage.getEpisode(query, { get: getMultiMock }, this.callback);
        },
        "no errors occured": function(err, data) {
            assert.isNull(err);
        },
        "the result has a *matched* field": function(err, data) {
            assert.isDefined(data.matched);
        },
        "the result has a *series* array with all the serie's name matches": function(err, data) {
            assert.isArray(data.series);
            assert.equal(2, data.series.length);
            assert.equal("Modern Family", data.series[0].name);
            assert.equal(22622, data.series[0].id);
            assert.equal("some other show", data.series[1].name);
            assert.equal(1, data.series[1].id);
        },
        "the episode details are returned in the *matched* field": {
            topic: function(data) { return data.matched; },
            "series name": function(details) {
                assert.equal("Modern Family", details.series);
            },
            "season": function(details) {
                assert.equal(2, details.season);
            },
            "episodes": function(details) {
                assert.equal(2, details.episodes.length);
                assert.equal("The Old Wagon", details.episodes[0].title);
                assert.equal(1, details.episodes[0].index.season);
                assert.equal("The Kiss", details.episodes[1].title);
                assert.equal(2, details.episodes[1].index.season);
            }
        }
    }
}).export(module);
