var vows = require("vows"),
    assert = require("assert"),
    values = require("./value-asserts"),
    
    fs = require("fs"),
    
    tvrage = require("../");

function GetXmlMock(resultFile) {
    var self = this;
    self.calls = [];
    
    self.get = function(url, callback) {
        self.calls.push(url);
        fs.readFile("./test/data/" + resultFile, {encoding: "utf-8"}, callback);
    }
    self.getOptions = function() {
        return {
            get: self.get
        };
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
    }
}).export(module);
