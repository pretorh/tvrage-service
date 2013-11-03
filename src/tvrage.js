module.exports = {
    search: function(series, options, callback) {
        var values = search.queryObject(series);
        makeApiCall(options, search, values, callback);
    },
    getEpisodeList: function(seriesId, options, callback) {
        var values = eplist.queryObject(seriesId);
        makeApiCall(options, eplist, values, callback);
    },
    getSeriesDetails: function(seriesId, options, callback) {
        var values = eplist.queryObject(seriesId);
        makeApiCall(options, seriesinfo, values, callback);
    }
};

var querystring = require("querystring"),
    defaultify = require("defaultify"),
    
    search = require("./search"),
    eplist = require("./eplist"),
    seriesinfo = require("./seriesinfo");

const API_ROOT_URL = "http://services.tvrage.com/feeds/";

function makeApiCall(userOptions, apiCall, values, callback) {
    var url = API_ROOT_URL + apiCall.apiName + ".php?" + querystring.stringify(values);
    
    buildOptions(userOptions, function(err, options) {
        if (err) {
            callback(err);
        } else {
            options.get(url, function(err, xml) {
                if (err) {
                    process.nextTick(function() {
                        callback(err);
                    });
                } else {
                    process.nextTick(function() {
                        apiCall.parse(xml, callback);
                    });
                }
            });
        }
    });
}

function buildOptions(user, callback) {
    const DEFAULT = {
        get: function() {}
    };
    
    try {
        var result = defaultify(user, DEFAULT, true);
        process.nextTick(function() {
            callback(null, result.value);
        });
    } catch (e) {
        process.nextTick(function() {
            callback(e);
        });
    }
}
