var vows = require("vows"),
    assert = require("assert"),
    
    tvrage = require("../");

vows.describe("integration").addBatch({
    "searching for *modern family*": {
        topic: function() {
            tvrage.search("modern family", this.callback);
        },
        "no error occured and result returned": function(err, res) {
            assert.isNull(err);
            assert.isNotNull(res);
        }
    }
}).export(module);
