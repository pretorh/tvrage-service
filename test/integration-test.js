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
            },
        }
    }
}).export(module);
