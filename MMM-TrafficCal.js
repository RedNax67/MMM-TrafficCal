/* global Module */

/* Magic Mirror
 * Module: MMM-TrafficCal
 *
 * By Sam Lewis https://github.com/SamLewis0602
 * MIT Licensed.
 */
 


Module.register('MMM-TrafficCal', {

    defaults: {
        api_key: '',
        mode: 'driving',
        interval: 300000, //all modules use milliseconds
        origin: '',
        destination: '',
        traffic_model: 'best_guess',
        departure_time: 'now',
        loadingText: 'Loading commute...',
        prependText: 'Current commute is',
        insteadofText: 'ipv',
        viaText: 'via',
        changeColor: false,
        limitYellow: 10,
        limitRed: 30,
        showGreen: true,
        language: config.language,
        show_summary: true
    },

    
    start: function() {
        
        Log.info('Starting module: ' + this.name);
        if (this.data.classes === 'MMM-TrafficCal') {
          this.data.classes = 'bright medium';
        }
        this.loaded = false;
        this.url = 'https://maps.googleapis.com/maps/api/directions/json' + this.getParams();
        this.urls = [];
        this.dests = [];
        this.descs = [];
        
		Log.info(this.url);
        
        var Do = {
            parallel: function (fns) {
                var results = [],
                counter = fns.length;
                return function(callback, errback) {
                    fns.forEach(function (fn, i) {
                        fn(function (result) {
                            results[i] = result;
                            counter--;
                            if (counter <= 0) {
                                callback.apply(null, results);
                            }
                        }, errback);
                    });
                }
            }
        };

        //module.exports = Do;

        this.symbols = {
            'driving': 'fa fa-car',
            'walking': 'fa fa-odnoklassniki',
            'bicycling': 'fa fa-bicycle',
            'transit': 'fa fa-train'
        };
        this.commute = '';
		this.withTraffic = '';
		this.noTraffic = '';
        this.summary = '';
        //this.updateCommute(this);
    },

    updateCommute: function(self) {
        self.sendSocketNotification('TRAFFIC_URL', self.urls, self.dests);
        setTimeout(self.updateCommute, self.config.interval, self);
    },

    getStyles: function() {
        return ['traffic.css', 'font-awesome.css'];
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        var commuteInfo = document.createElement('div'); //support for config.changeColor
		commuteInfo.className = 'small';

        if (!this.loaded) {
            // wrapper.innerHTML = this.config.loadingText;
            wrapper.innerHTML = "";
            return wrapper;
        }


        var table = document.createElement("table");
        table.className = "small";
        table.setAttribute("width", "25%");
        
        for (f in this.commute) {
            var mycommute =  this.commute[f];
            
            var row = document.createElement("tr");
            table.appendChild(row);

            var symbol = document.createElement('td');
            symbol.className = this.symbols[mycommute.mode] + ' symbol';
            row.appendChild(symbol);

            var commuteCell = document.createElement("td");
            //commuteCell.className = "c";
            if (mycommute.noTraffic) {
                commuteCell.innerHTML = mycommute.description + ' ' + mycommute.commute + ' ' + this.config.insteadofText + ' ' + mycommute.noTraffic + ' ' + this.config.viaText + ' ' + mycommute.summary;
            } else {
                commuteCell.innerHTML = mycommute.description + ' ' + mycommute.commute;
            }

            //change color if desired and append
            if (this.config.changeColor) {
                if (mycommute.trafficComparison >= 1 + (this.config.limitRed / 100)) {
                    commuteCell.className += ' red';
                    symbol.className += ' red';
                } else if (mycommute.trafficComparison >= 1 + (this.config.limitYellow / 100)) {
                    commuteCell.className += ' yellow';
                    symbol.className += ' yellow';
                } else if (this.config.showGreen) {
                    commuteCell.className += ' green';
                    symbol.className += ' green';
                }
            }
            row.appendChild(symbol);
            row.appendChild(commuteCell);
        }
        wrapper.appendChild(table);
        return wrapper;
    },

    getParams: function() {
        var params = '?';
        params += 'key=' + this.config.api_key;
        params += '&traffic_model=' + this.config.traffic_model;
        params += '&departure_time=now';
        params += '&language=' + this.config.language;
        return params;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'TRAFFIC_COMMUTE') {
            Log.info('received TRAFFIC_COMMUTE');
			Log.info('TRAFFIC URLS: ' + this.urls);
            this.commute = [];
            for (e in payload.commutes) {
                this.commute.push({
                    commute: payload.commutes[e],
                    summary: payload.summaries[e],
                    trafficComparison: payload.trafficComparisons[e],
                    noTraffic: payload.noTraffics[e],
                    withTraffic: payload.withTraffics[e],
                    destination: payload.destinations[e],
                    description: payload.comments[e],
                    mode: payload.modes[e]
                    
                });
            }
            this.loaded = true;
            this.updateDom(1000);
        }
    },
    
    notificationReceived: function(notification, payload, sender) {
        this.pload = [];
        this.urls = [];
        if (sender) {
            if (notification === 'CALENDAR_EVENTS') {
                for (var e in payload) {
                    var event = payload[e];
                    if (event.title.substring(0,6) === this.config.tripkey) {
                        var infos = event.description.split(":");
                        var description = infos[0]  || event.location;
                        var origin = infos[1] || this.config.origin;
                        var tmode = infos[2] || this.config.mode;
                        this.url = 'https://maps.googleapis.com/maps/api/directions/json' + this.getParams() + '&destination=' + event.location + '&origin=' + origin + '&mode=' + tmode + '&comment=' + description + '&startDate=' + event.startDate;
                        if (this.urls.indexOf(this.url) === -1) { //Prevent duplicate entries
                            this.urls.push(this.url);
                        }
                    }
                }

                this.pload.push(this.urls);
              
                this.sendSocketNotification('TRAFFIC_URL', this.pload);
            }
        } 
    },   


});

