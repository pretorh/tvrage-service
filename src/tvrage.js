module.exports = {
    search: function(series, getXmlFromUrl, callback) {
        var values = search.queryObject(series);
        makeApiCall(getXmlFromUrl, search, values, callback);
    }
};

var querystring = require("querystring"),
    search = require("./search");

const API_ROOT_URL = "http://services.tvrage.com/feeds/";

function makeApiCall(getXmlFromUrl, options, values, callback) {
    var url = API_ROOT_URL + options.apiName + ".php?" + querystring.stringify(values);
    
    getXmlFromUrl(url, function(err, xml) {
        process.nextTick(function() {
            if (err) {
                callback(err);
            } else {
                options.parse(xml, callback);
            }
        });
    });
}
