var vows = require("vows"),
    fs = require("fs"),
    assert = require("assert"),
    xml2js = require("xml2js"),
    xph = require("../src/xmlparsehelper"),
    search = require("../src/search"),
    eplist = require("../src/eplist");

function getTestXml(name, callback) {
    var xml = fs.readFileSync("./test/data/" + name + ".xml", {encoding: "utf-8"});
    xml2js.parseString(xml, callback);
}

vows.describe("parsing").addBatch({
    "given raw xml": {
        topic: function() {
            return "<a><b>value</b></a>";
        },
        "when it is parsed, searching for root *a*": {
            topic: function(xml) {
                return xph.parseToNode(xml, "a", this.callback);
            },
            "no error occured": function(err, results) {
                assert.isNull(err);
            },
            "the result is an object": function(err, obj) {
                assert.isObject(obj);
            },
            "the result has field *b* == 'value'": function(err, obj) {
                assert.equal(obj.b[0], "value");
            },
            "the result can be mapped to an object": {
                topic: function(xmlObj) {
                    return xph.mapSimpleFields(xmlObj, ["b"]);
                },
                "which returns an object": function(mappedObj) {
                    assert.isObject(mappedObj);
                },
                "with a string field *b* with value *value*": function(mappedObj) {
                    assert.equal(typeof(mappedObj.b), "string");
                    assert.equal(mappedObj.b, "value");
                }
            }
        },
        "when it is parsed, searching for root *a.root*": {
            topic: function(xml) {
                return xph.parseToNode(xml, "a.root", this.callback);
            },
            "an error occurs": function(err, results) {
                assert.isNotNull(err);
                assert.isUndefined(results);
                assert.equal(err.error, "root not found");
                assert.equal(err.detailed, "expected 'root' in {\"b\":[\"value\"]}");
            }
        }
    },
    "with search results parsed": {
        topic: function() {
            var xml = fs.readFileSync("./test/data/search.xml", {encoding: "utf-8"});
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
    },
    "with the episode list results parsed": {
        topic: function() {
            var xml = fs.readFileSync("./test/data/episode_list.xml", {encoding: "utf-8"});
            eplist.parse(xml, this.callback);
        },
        "no errors occured": function(err, result) {
            assert.isNull(err);
            assert.isNotNull(result);
        },
        "the result is an array of length 2": function(err, result) {
            assert.isArray(result);
            assert.equal(result.length, 2);
        },
        "given the *first* season": {
            topic: function(results) {
                return results[0];
            },
            "the season is number *1*": function(season) {
                assert.equal(season.number, 1);
            },
            "the season has a *list* array of length 2": function(season) {
                assert.isArray(season.list);
                assert.equal(season.list.length, 2);
            },
            "and the *first* episode in the season": {
                topic: function(season) {
                    return season.list[0];
                },
                "is for *Pilot*": function(ep) {
                    assert.equal(ep.index.overall, 1);
                    assert.equal(ep.index.season, 1);
                    assert.equal(ep.aired, "2009-09-23");
                    assert.equal(ep.link, "http://www.tvrage.com/Modern_Family/episodes/1064810238");
                    assert.equal(ep.title, "Pilot");
                }
            }
        },
        "given the *second* season": {
            topic: function(results) {
                return results[1];
            },
            "the season is number *2*": function(season) {
                assert.equal(season.number, 2);
            },
            "the season has a *list* array of length 2": function(season) {
                assert.isArray(season.list);
                assert.equal(season.list.length, 2);
            },
            "and the *second* episode in the season": {
                topic: function(season) {
                    return season.list[1];
                },
                "is for *The Kiss*": function(ep) {
                    assert.equal(ep.index.overall, 26);
                    assert.equal(ep.index.season, 2);
                    assert.equal(ep.aired, "2010-09-29");
                    assert.equal(ep.link, "http://www.tvrage.com/Modern_Family/episodes/1064975829");
                    assert.equal(ep.title, "The Kiss");
                }
            }
        }
    },
    "series info results": {
        topic: fs.readFileSync("./test/data/episodeinfo.xml", {encoding: "utf-8"}),
        "not yet implemented": function() {
        }
    }
}).export(module);
