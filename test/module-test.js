var vows = require("vows"),
    assert = require("assert");

function buildModuleVerifier(options) {
    var s = {
        topic: function() {
            return require("../src/" + options.moduleName);
        },
        "has a function *parse*": function(module) {
            assert.isFunction(module.parse);
        },
        "has a string *apiName*": function(module) {
            assert.equal(typeof(module.apiName), "string");
            assert.equal(module.apiName, options.apiName);
        },
        "has a function *queryObject*": function(module) {
            assert.isFunction(module.queryObject);
        }
    };
    
    for (var i = 0; i < options.queryFuncFields.length; ++i) {
        var f = options.queryFuncFields[i];
        s["queryObject returns an object with field " + f] = function(module) {
            var obj = module.queryObject();
            assert.isObject(obj);
            assert.isNotNull(obj[f]);
        }
    }
    
    return s;
}

vows.describe("modules").addBatch({
    "search": buildModuleVerifier({
        moduleName: "search",
        apiName: "search",
        queryFuncFields: ["show"]
    }),
    
    "eplist": buildModuleVerifier({
        moduleName: "eplist",
        apiName: "episode_list",
        queryFuncFields: ["sid"]
    }),
    
    "series info": buildModuleVerifier({
        moduleName: "seriesinfo",
        apiName: "episodeinfo",
        queryFuncFields: ["sid"]
    })
}).export(module);
