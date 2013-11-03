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
}

vows.describe("http test").addBatch({
    "when searching for a series": {
        topic: function(mock) {
            var cb = this.callback;
            var mock = new GetXmlMock("search.xml");
            tvrage.search("series name", mock.get, function(err, result) {
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
    }
}).export(module);
