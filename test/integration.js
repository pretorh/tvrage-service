var vows = require("vows"),
    assert = require("assert"),
    
    tvrage = require("../");

vows.describe("integration").addBatch({
    "searching for *modern family*": {
        topic: function() {
            tvrage.search("modern family", this.callback);
        },
        "no error occured": function(err, res) {
            assert.isNull(err);
        },
        "at least 1 result returned": function(err, res) {
            assert.isNotNull(res);
            assert(res.length > 0);
        },
        
        "when listing the episodes for the first result": {
            topic: function(results) {
                tvrage.getEpisodeList(results[0].id, this.callback);
            },
            "no error occured": function(err, res) {
                assert.isNull(err);
            },
            "at least 5 seasons returned": function(err, res) {
                assert.isNotNull(res);
                assert(res.length >= 5);
            }
        },
        
        "when getting series details for the first result": {
            topic: function(results) {
                var cb = this.callback;
                tvrage.getSeriesDetails(results[0].id, function(e, d) {
                    cb(e, {
                        data: d,
                        firstSearchResult: results[0]
                    });
                });
            },
            "no error occured": function(err, res) {
                assert.isNull(err);
            },
            "an object is returned": function(err, res) {
                assert.isObject(res.data);
            },
            "with details about the series matching the first result": function(err, res) {
                assert.equal(res.data.id, res.firstSearchResult.id);
                assert.equal(res.data.name, res.firstSearchResult.name);
            }
        }
    }
}).export(module);
