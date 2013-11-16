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
    },
    getEpisode: function(query, options, callback) {
        var params = fixParameters(options, callback);
        getEpisodeDetails(query, params.options, params.callback);
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

function getEpisodeDetails(query, options, callback) {
    module.exports.search(query.series, options, function(err, series) {
        if (err) {
            callback(err);
        } else {
            module.exports.getEpisodeList(series[0].id, options, function(err, list) {
                if (err) {
                    callback(err);
                } else {
                    var season = findMatchingSeason(list, query);
                    var eps = findMatchingEps(season, query);

                    callback(null, {
                        series: series,
                        matched: {
                            series: series[0].name,
                            season: season.number,
                            episodes: eps
                        }
                    });
                }
            });
        }
    });
}

function findMatchingSeason(list, query) {
    for (var i = 0; i < list.length; ++i) {
        if (list[i].number == query.season) {
            return list[i];
        }
    }
    return {number:null, list:[]};
}

function findMatchingEps(eps, query) {
    var result = [];
    if (eps && eps.list) {
        for (var i = 0; i < eps.list.length; ++i) {
            for (var x = 0; x < query.episodes.length; ++x) {
                if (eps.list[i].index.season == query.episodes[x]) {
                    result.push(eps.list[i]);
                }
            }
        }
    }
    return result;
}

function makeApiCall(userOptions, apiCall, values, callback) {
    var qs = querystring.stringify(values);
    var url = API_ROOT_URL + apiCall.apiName + ".php?" + qs;

    buildOptions(userOptions, function(err, options) {
        if (err) {
            callback(err);
        } else {
            var cacheKey = apiCall.apiName + ":" + qs;
            options.cache(cacheKey, function(cachedValue) {
                if (cachedValue) {
                    callback(null, cachedValue);
                } else {
                    // cache miss
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
                                    apiCall.parse(xml, function(err, data) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            options.save(cacheKey, data);
                                            callback(null, data);
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

function buildOptions(user, callback) {
    const DEFAULT = {
        get: serviceClientWrapper,
        cache: redisWrapper.cache,
        save: redisWrapper.save
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

function RedisWrapper() {
    var self = this;
    var redis = null;

    self.cache = function(key, callback) {
        if (redis) {
            redis.get(key, function(err, value) {
                callback(JSON.parse(value));
            });
        } else {
            // always cache miss
            callback(null);
        }
    }
    self.save = function(key, value) {
        if (redis) {
            redis.set(key, JSON.stringify(value));
        } // else: no-op
    }

    function createRedis() {
        try {
            var r = require("redis").createClient();
            r.on("ready", function() {
                redis = r;
            });
        } catch (e) { /* ignored */ }
    }

    process.nextTick(createRedis);
}

var redisWrapper = new RedisWrapper();

