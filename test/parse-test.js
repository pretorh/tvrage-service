var vows = require("vows"),
    assert = require("assert"),
    
    values = require("./value-asserts"),
    fs = require("fs"),
    
    xph = require("../src/xmlparsehelper"),
    search = require("../src/search"),
    eplist = require("../src/eplist"),
    seriesinfo = require("../src/seriesinfo");

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
            values.isModernFamily(result[0]);
        },
        "the second element matches *some other show*": function(err, result) {
            values.isSomeOtherShow(result[1]);
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
                "is for *Pilot*": values.isPilot
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
                "is for *The Kiss*": values.isTheKiss
            }
        }
    },
    
    "with the series info results": {
        topic: function() {
            var xml = fs.readFileSync("./test/data/episodeinfo.xml", {encoding: "utf-8"});
            seriesinfo.parse(xml, this.callback);
        },
        "no errors occured": function(err, result) {
            assert.isNull(err);
            assert.isNotNull(result);
        },
        "the result has some basic details": function(err, result) {
            values.hasModernFamilyDetails(result);
        },
        "the result has the airtime": function(err, result) {
            values.hasModernFamilyAirtime(result);
        },
        "the latest ep is *05x06*": function(err, result) {
            values.hasModernFamilyLatestEp(result);
        },
        "the next ep is *05x07*": function(err, result) {
            values.hasModernFamilyNextEp(result);
        }
    },
    
    "with an ended series' info results": {
        topic: function() {
            var xml = fs.readFileSync("./test/data/episodeinfo2.xml", {encoding: "utf-8"});
            seriesinfo.parse(xml, this.callback);
        },
        "no errors occured": function(err, result) {
            assert.isNull(err);
            assert.isNotNull(result);
        },
        "the next ep object is *undefined*": function(err, result) {
            assert.isUndefined(result.next);
        }
    },
    
    "when parsing a series with no genres": {
        topic: function() {
            var xml = fs.readFileSync("./test/data/no-genre.xml", {encoding: "utf-8"});
            search.parse(xml, this.callback);
        },
        "no errors occured": function(err, result) {
            assert.isNull(err);
            assert.isNotNull(result);
        },
        "but the other values are populated": function(err, result) {
            assert.equal(result.length, 1);
            values.isShowWithoutGenres(result[0]);
        }
    }
}).export(module);
