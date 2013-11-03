module.exports = {
    search: function(series, options, callback) {
        var params = fixParameters(options, callback);
        var values = search.queryObject(series);
        makeApiCall(params.options, search, values, params.callback);
    },
    getEpisodeList: function(seriesId, options, callback) {
        var params = fixParameters(options, callback);
        var values = eplist.queryObject(seriesId);
        makeApiCall(params.options, eplist, values, params.callback);
    },
    getSeriesDetails: function(seriesId, options, callback) {
        var params = fixParameters(options, callback);
        var values = eplist.queryObject(seriesId);
        makeApiCall(params.options, seriesinfo, values, params.callback);
    }
};

function fixParameters(options, callback) {
    var onlyHaveCallback = (typeof(options) === "function" && callback === undefined);
    
    return {
        options: onlyHaveCallback ? {} : options,
        callback: onlyHaveCallback ? options : callback
    };
}

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
            if (options.get === serviceClientWrapper) {
                serviceClientWrapper(apiCall, url, callback);
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
        }
    });
}

function buildOptions(user, callback) {
    const DEFAULT = {
        get: serviceClientWrapper
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

function serviceClientWrapper(apiCall, url, callback) {
    try {
        var sc = require("service-client");
        sc.get(url, { parse: apiCall.parse }, callback);
    } catch (e) {
        callback(e);
    }
}
