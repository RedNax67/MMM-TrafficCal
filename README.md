# MMM-TrafficCal
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror/tree/develop). It can display commute time between two given addresses by car, walking, bicycling, or transit. The module uses the Google Maps Directions API to get commute time, which factors in traffic information.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/RedNax67/MMM-TrafficCal.git`. A new folder will appear, navigate into it.
2. Execute `npm install` to install the node dependencies.

## Config
The entry in `config.js` can include the following options:
              

|Option|Description|
|---|---|
|`apiKey`|The API key, which can be obtained [here](https://developers.google.com/maps/documentation/directions/).<br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`origin`|The start location as the address or name of a location.<br>**Example:** `'Yankee Stadium'` or `'500 Main Street New York NY'`<br><br>This value is **REQUIRED**|
|`tripkey`|A keyword so the module can identify commutes you want to display. You'll have to start the calender entry title with this word<br>**Example:** `'MYTRIP'`<br><br>This value is **REQUIRED**|
|`mode`|Mode of transportation.<br><br>**Default value:** `'driving'`<br>**Other Options:**`'walking' 'bicycling' 'transit'`|
|`traffic_model`|Model for traffic estimation.<br><br>**Default value:** `'best_guess'`<br>**Other Options:**`'optimistic' 'pessimistic'`|
|`changeColor`|When `changeColor` is set to true, the color of the commute info will change based on traffic. If traffic increases the commute by `limitYellow`, the symbol and commute text will be yellow. An increase of `limitRed` will change the color to red. If the traffic doesn't increase the commute by at least `limitYellow`, the color will be green.<br><br>**Default value:** `false`|
|`limitYellow`|Percentage increase in commute time due to traffic to turn commute text yellow.<br><br>**Default value:** `10`|
|`limitRed`|Percentage increase in commute time due to traffic to turn commute text red.<br><br>**Default value:** `30`|
|`showGreen`|If you've set `changeColor` to true but would like the commute text to remain white instead of turn green when there's light/no traffic, set `showGreen` to false.<br><br>**Default value:** `true`|
|`interval`|How often the traffic is updated.<br><br>**Default value:** `300000 //5 minutes`|
|`loadingText`|The text used when loading the initial commute time.<br><br>**Default value:** `'Loading commute...'`|
|`prependText`|The text used in front of the commute time.<br><br>**Default value:** `'Current commute is'`|
|`language`|Define the commute time language.<br><br>**Example:** `en`<br>**Default value:** `config.language`|

Here is an example of an entry in `config.js`
```
{
	module: 'MMM-TrafficCal',
	position: 'top_left',
	classes: 'dimmed medium', //optional, default is 'bright medium', only applies to commute info not route_name
	config: {
		api_key: 'your_apikey_here',
		mode: 'driving',
        tripkey: 'MYTRIP',
		origin: '4 Pennsylvania Plaza, New York, NY 10001',
		changeColor: true,
		showGreen: false,
		limitYellow: 5, //Greater than 5% of journey time due to traffic
		limitRed: 20, //Greater than 20% of journey time due to traffic
		traffic_model: 'pessimistic',
		interval: 120000 //2 minutes
	}
},
```

## Dependencies
- [request](https://www.npmjs.com/package/request) (installed via `npm install`)
- [calendar] You'll need to add entries in your calendar starting with the tripkey keyword and the full (google suggested) address for your destination. Add the text you want prepended in the remarks field in the appointment.


## Important Notes
- This project is based upon MMM-Traffic by Sam Lewis git clone https://github.com/SamLewis0602/MMM-Traffic.git 
- This module needs the calendar event broadcast feature currently in the development branch.


## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
- [Paul-Vincent Roll](https://github.com/paviro) for creating the [Wunderlist](https://github.com/paviro/MMM-Wunderlist) module that I used as guidance in creating this module.
