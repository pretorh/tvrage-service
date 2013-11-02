var vows = require("vows"),
    fs = require("fs")

vows.describe("parsing").addBatch({
    "search results": {
        topic: fs.readFileSync("./test/data/search.xml", {encoding: "utf-8"}),
        "not yet implemented": function() {
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
