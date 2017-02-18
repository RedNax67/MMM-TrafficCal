/* Magic Mirror
 * Module: MMM-TrafficCal
 *
 * By Sam Lewis https://github.com/SamLewis0602
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function() {
        console.log('MMM-TrafficCal helper started ...');
    },

    getCommute: function(payload) {
        var self = this;
        var commutes = [];
        var trafficComparisons = [];
        var summaries = [];
        var noTraffics = [];
        var withTraffics = [];
        var destinations = [];
        var startdates = [];
        var origins = [];
        var modes = [];
        var api_urls = [];
        var comments = [];
        var noTrafficValue = '';
        var withTrafficValue = '';

        if (payload[0].length === 0) {
            self.sendSocketNotification('TRAFFIC_COMMUTE', {
                'commutes': commutes,
                'trafficComparisons': trafficComparisons,
                'summaries': summaries,
                'noTraffics': noTraffics,
                'withTraffics': withTraffics,
                'destinations': destinations,
                'startdates' : startdates,
                'origins': origins,
                'modes': modes,
                'api_urls': api_urls,
                'comments': comments
            });

        } else {

            for (var e in payload[0]) {

            this.api_url = payload[0][e];
            console.log(this.api_url);
                request({
                        url: this.api_url,
                        method: 'GET'
                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var trafficComparison = 0;

                            if (JSON.parse(body).status == 'OK') {

                                var lUrl = decodeURI(this.uri.href);
                                var lQuery = decodeURI(this.uri.query);

                                if (JSON.parse(body).routes[0].legs[0].duration_in_traffic) {
                                    var commute = JSON.parse(body).routes[0].legs[0].duration_in_traffic.text;
                                    var noTrafficValue = JSON.parse(body).routes[0].legs[0].duration.value;
                                    var withTrafficValue = JSON.parse(body).routes[0].legs[0].duration_in_traffic.value;
                                    var noTraffic = JSON.parse(body).routes[0].legs[0].duration.text;
                                    var withTraffic = JSON.parse(body).routes[0].legs[0].duration_in_traffic.text;
                                    var trafficComparison = parseInt(withTrafficValue) / parseInt(noTrafficValue);
                                    var summary = JSON.parse(body).routes[0].summary;
                                } else {
                                    var commute = JSON.parse(body).routes[0].legs[0].duration.text;
                                }
                            } else {
                                var commute = JSON.parse(body).error_message;
                                var summary = JSON.parse(body).status;

                            }
                            var queries = lQuery.split("&");
                            for (var f in queries) {
                                if (queries[f].indexOf("mode=") != -1) {
                                    modes.push(queries[f].substring(5));
                                }
                                if (queries[f].indexOf("comment=") != -1) {
                                    comments.push(queries[f].substring(8));
                                }
                                if (queries[f].indexOf("origin=") != -1) {
                                    origins.push(queries[f].substring(7));
                                }
                                if (queries[f].indexOf("destination=") != -1) {
                                    destinations.push(queries[f].substring(12));
                                }
                                if (queries[f].indexOf("startDate=") != -1) {
                                    console.log('startdate: ' + queries[f].substring(10));

                                    startdates.push(queries[f].substring(10));
                                }
                            }

                            commutes.push(commute);
                            trafficComparisons.push(trafficComparison);
                            summaries.push(summary);
                            noTraffics.push(noTraffic);
                            withTraffics.push(withTraffic);
                            api_urls.push(this.lUrl);

                            if (commutes.length == payload[0].length) {

                                var list = [];
                                for (var j in startdates) 
                                    list.push({ 'commute': commutes[j],
                                                'trafficComparison': trafficComparisons[j],
                                                'summarie': summaries[j],
                                                'noTraffic': noTraffics[j],
                                                'withTraffic': withTraffics[j],
                                                'destination': destinations[j],
                                                'startdate' : startdates[j],
                                                'origin': origins[j],
                                                'mode': modes[j],
                                                'api_url': api_urls[j],
                                                'comment': comments[j]
                                    });

                                //2) sort:
                                list.sort(function(a, b) {
                                    return ((a.startdate < b.startdate) ? -1 : ((a.startdate == b.startdate) ? 0 : 1));
                                    //Sort could be modified to, for example, sort on the age 
                                    // if the name is the same.
                                });

                                //3) separate them back out:
                                for (var k = 0; k < list.length; k++) {
                                    commutes[k] = list[k].commute;
                                    trafficComparisons[k] = list[k].trafficComparison;
                                    summaries[k] = list[k].summarie;
                                    noTraffics[k] = list[k].noTraffic;
                                    withTraffics[k] = list[k].withTraffic;
                                    destinations[k] = list[k].destination;
                                    startdates[k] = list[k].startdate;
                                    origins[k] = list[k].origin;
                                    modes[k] = list[k].mode;
                                    api_urls[k] = list[k].api_url;
                                    comments[k] = list[k].comment;
                                }

                                
                                self.sendSocketNotification('TRAFFIC_COMMUTE', {
                                    'commutes': commutes,
                                    'trafficComparisons': trafficComparisons,
                                    'summaries': summaries,
                                    'noTraffics': noTraffics,
                                    'withTraffics': withTraffics,
                                    'destinations': destinations,
                                    'startdates' : startdates,
                                    'origins': origins,
                                    'modes': modes,
                                    'api_urls': api_urls,
                                    'comments': comments
                                });
                            }
 
                        }
                    }


                );
            }
        }


    },


    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        //console.log(notification + payload);
        if (notification === 'TRAFFIC_URL') {
            this.getCommute(payload);
        }
    }

});