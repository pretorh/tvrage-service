module.exports = {
    isModernFamily: isModernFamily,
    isSomeOtherShow: isSomeOtherShow,
    isPilot: isPilot,
    isTheKiss: isTheKiss,
    hasModernFamilyDetails: hasModernFamilyDetails,
    hasModernFamilyAirtime: hasModernFamilyAirtime,
    hasModernFamilyLatestEp: hasModernFamilyLatestEp,
    hasModernFamilyNextEp: hasModernFamilyNextEp
};

var assert = require("assert");

function isModernFamily(data) {
    assert.equal(data.id, 22622);
    assert.equal(data.name, "Modern Family");
    assert.equal(data.link, "http://www.tvrage.com/Modern_Family");
    assert.equal(data.started, 2009);
    assert.equal(data.ended, null);
    assert.equal(data.seasons, 5);
    assert.equal(data.genres.length, 1);
    assert.equal(data.genres[0], "Comedy");
}

function isSomeOtherShow(data) {
    assert.equal(data.id, 1);
    assert.equal(data.name, "some other show");
    assert.equal(data.link, "http://www.tvrage.com/some_other_show");
    assert.equal(data.started, 1995);
    assert.equal(data.ended, 1996);
    assert.equal(data.seasons, 1);
    assert.equal(data.genres.length, 2);
    assert.equal(data.genres[0], "genre1");
    assert.equal(data.genres[1], "genre2");
}

function isPilot(ep) {
    assert.equal(ep.index.overall, 1);
    assert.equal(ep.index.season, 1);
    assert.equal(ep.aired, "2009-09-23");
    assert.equal(ep.link, "http://www.tvrage.com/Modern_Family/episodes/1064810238");
    assert.equal(ep.title, "Pilot");
}

function isTheKiss(ep) {
    assert.equal(ep.index.overall, 26);
    assert.equal(ep.index.season, 2);
    assert.equal(ep.aired, "2010-09-29");
    assert.equal(ep.link, "http://www.tvrage.com/Modern_Family/episodes/1064975829");
    assert.equal(ep.title, "The Kiss");
}

function hasModernFamilyDetails(result) {
    assert.equal(result.id, 22622);
    assert.equal(result.name, "Modern Family");
    assert.equal(result.status, "Returning Series");
    assert.equal(result.runtime, 30);
}

function hasModernFamilyAirtime(result) {
    assert.isNotNull(result.airtime);
    assert.equal(result.airtime.day, 3);
    assert.equal(result.airtime.dayName, "Wednesday");
    assert.equal(result.airtime.time, 21 * 60);
    assert.equal(result.airtime.timeString, "09:00 pm");
}

function hasModernFamilyLatestEp(result) {
    assert.isNotNull(result.latest);
    assert.equal(result.latest.season, 5);
    assert.equal(result.latest.number, 6);
    assert.equal(result.latest.title, "The Help");
    assert.equal(result.latest.aired, "2013-10-23");
}

function hasModernFamilyNextEp(result) {
    assert.isNotNull(result.next);
    assert.equal(result.next.season, 5);
    assert.equal(result.next.number, 7);
    assert.equal(result.next.title, "A Fair to Remember");
    assert.equal(result.next.aired, "2013-11-13");
}
