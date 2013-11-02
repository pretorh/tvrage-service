var vows = require("vows"),
    fs = require("fs"),
    assert = require("assert"),
    xml2js = require("xml2js"),
    search = require("../src/search");

function getTestXml(name, callback) {
    var xml = fs.readFileSync("./test/data/" + name + ".xml", {encoding: "utf-8"});
    xml2js.parseString(xml, function(err, data) {
        callback(err, data);
    });
}

vows.describe("parsing").addBatch({
    "with search results": {
        topic: function() { getTestXml("search", this.callback) },
        "when the xml is parsed": {
            topic: function(xml) {
                search.parse(xml, this.callback);
            },
            "no errors occured": function(err, result) {
                assert.isNull(err);
                assert.isNotNull(result);
            },
            "the result is an array of length 2": function(err, result) {
                assert.isArray(result);
                assert.equal(result.length, 2);
            },
            "the first element matches *Modern Family*": function(err, result) {
                assert.equal(result[0].id, 22622);
                assert.equal(result[0].name, "Modern Family");
                assert.equal(result[0].link, "http://www.tvrage.com/Modern_Family");
                assert.equal(result[0].started, 2009);
                assert.equal(result[0].ended, null);
                assert.equal(result[0].seasons, 5);
                assert.equal(result[0].genres.length, 1);
                assert.equal(result[0].genres[0], "Comedy");
            },
            "the second element matches *some other show*": function(err, result) {
                assert.equal(result[1].id, 1);
                assert.equal(result[1].name, "some other show");
                assert.equal(result[1].link, "http://www.tvrage.com/some_other_show");
                assert.equal(result[1].started, 1995);
                assert.equal(result[1].ended, 1996);
                assert.equal(result[1].seasons, 1);
                assert.equal(result[1].genres.length, 2);
                assert.equal(result[1].genres[0], "genre1");
                assert.equal(result[1].genres[1], "genre2");
            }
        }
    },
    "episode list results": {
        topic: fs.readFileSync("./test/data/episode_list.xml", {encoding: "utf-8"}),
        "not yet implemented": function() {
        }
    },
    "series info results": {
        topic: fs.readFileSync("./test/data/episodeinfo.xml", {encoding: "utf-8"}),
        "not yet implemented": function() {
        }
    }
}).export(module);
