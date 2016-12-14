OS Toolbox
==========
[![NPM version][npm-image]][npm-url]

## Installation
``` bash
$ npm install os-toolbox
```

## Usage

``` javascript
var ostb = require( 'os-toolbox' );
```

### Before use 
**/!\ All functions use promises !**

### Get platform
Get platform name.
``` javascript
ostb.platform(); //ex : linux
```

### Get uptime
Get system uptime in seconds.
``` javascript
ostb.uptime(); //ex : 419419
```

### Get CPU load
Get cpu load percentage.
``` javascript
ostb.cpuLoad().then(function(cpuusage){
   console.log(cpuusage); //ex: 34 (percent)
});
```

### Get memory usage
Get memory usage percentage.
``` javascript
ostb.memoryUsage().then(function(memusage){
   console.log(memusage); //ex: 93 (percent)
}, function(error){
    //errors here
});
```

### Get current processes
Get current running processes order by cpu usage.
``` javascript
ostb.currentProcesses().then(function(processes){
   console.log(processes);
}, function(error){
    //errors here
});
```

The following is an example current processes output :

``` javascript
[
   {
      "pid":1,
      "name":"micro-inetd",
      "cpu":0,
      "mem":{
         "private":192512,
         "virtual":4153344,
         "usage":0.00035077548249540783
      }
   },
   {
      "pid":264,
      "name":"dropbear",
      "cpu":0,
      "mem":{
         "private":2326528,
         "virtual":19845120,
         "usage":0.004239159022497695
      }
   },
   {
      "pid":774,
      "name":"tmux",
      "cpu":0,
      "mem":{
         "private":2904064,
         "virtual":126709760,
         "usage":0.0052914854699839175
      }
	}
]
```

## License

[MIT license](http://opensource.org/licenses/MIT). 

[npm-image]: https://img.shields.io/npm/v/os-toolbox.svg
[npm-url]: https://www.npmjs.com/package/os-toolbox