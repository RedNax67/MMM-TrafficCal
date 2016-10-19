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
        var noTrafficValue = '';
        var withTrafficValue = '';
        var commutes = [];
        var trafficComparisons = [];
        var summaries = [];
        var noTraffics = [];
        var withTraffics = [];
        var destinations = [];
        var api_urls = [];
        var descriptions = [];
        var reqdone = 0;
        //console.log("Payload: " + payload);
        
        if (payload[0].length === 0 ) {
            self.sendSocketNotification('TRAFFIC_COMMUTE', {
                'commutes': commutes,
                'trafficComparisons': trafficComparisons,
                'summaries': summaries,
                'noTraffics': noTraffics,
                'withTraffics': withTraffics,
                'destinations': destinations,
                'descriptions': descriptions
            });
            
        } else {

        for (var e in payload[0]) {

            var api_url = payload[0][e];

            //console.log("api_url: " + api_url);
            //console.log("desc: " + desc);
            //console.log("Requesting: "  + api_url);

            request({
                    url: api_url,
                    method: 'GET'
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var trafficComparison = 0;

                        if (JSON.parse(body).status == 'OK') {

                            if (JSON.parse(body).routes[0].legs[0].duration_in_traffic) {
                                var commute = JSON.parse(body).routes[0].legs[0].duration_in_traffic.text;
                                var noTrafficValue = JSON.parse(body).routes[0].legs[0].duration.value;
                                var withTrafficValue = JSON.parse(body).routes[0].legs[0].duration_in_traffic.value;
                                var noTraffic = JSON.parse(body).routes[0].legs[0].duration.text;
                                var withTraffic = JSON.parse(body).routes[0].legs[0].duration_in_traffic.text;
                                trafficComparison = parseInt(withTrafficValue) / parseInt(noTrafficValue);
                                var summary = JSON.parse(body).routes[0].summary;
                                var destination = JSON.parse(body).routes[0].legs[0].end_address;

                            } else {
                                var commute = JSON.parse(body).routes[0].legs[0].duration.text;
                            }
                        } else {
                            var commute = JSON.parse(body).error_message;
                            var summary = JSON.parse(body).status;
                        }

                        commutes.push(commute);
                        trafficComparisons.push(trafficComparison);
                        summaries.push(summary);
                        noTraffics.push(noTraffic);
                        withTraffics.push(withTraffic);
                        destinations.push(destination);

                        for (var f in payload[1]) {
                            if (payload[1][f] === destination) {
                                descriptions.push(payload[2][f]);
                            }
                        }

                        //console.log("commutes: " + commutes);
                        //console.log("descs: " + e + " " + descriptions);


                        if (commutes.length == payload[0].length) {
                            self.sendSocketNotification('TRAFFIC_COMMUTE', {
                                'commutes': commutes,
                                'trafficComparisons': trafficComparisons,
                                'summaries': summaries,
                                'noTraffics': noTraffics,
                                'withTraffics': withTraffics,
                                'destinations': destinations,
                                'descriptions': descriptions
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