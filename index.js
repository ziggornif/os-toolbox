'use strict'
const q = require('q');
var os = require('os');
const _ = require('lodash');
const ps = require('current-processes');
const childProcess = require('child_process')

exports.platform = function() {
    return process.platform;
}

exports.uptime = function() {
    return os.uptime();
}

exports.cpuLoad = function() {
    var deffered = q.defer();
    var beforeCpuInfos = getCPUInfo();
	
    setTimeout(function() {
        var afterCpuInfos = getCPUInfo();
		
        var idle 	= afterCpuInfos.idle - beforeCpuInfos.idle;
        var total 	= afterCpuInfos.total - beforeCpuInfos.total;
        var perc	= idle / total;
	  	
        deffered.resolve(Math.floor((1 - perc) * 100));
	  		
    }, 1000 );
    return deffered.promise;
}

exports.memoryUsage = function() {
    var deffered = q.defer();
    var computeUsage = function(used, total) {
        return Math.round(100 * (used / total));
    };

    childProcess.exec('free -m', function(err, stdout, stderr) {
        if (err) {
            deffered.reject(err);
        } else {
            var data = stdout.split('\n')[1].replace(/[\s\n\r]+/g, ' ').split(' ');
            var used = parseInt(data[2]);
            var total = parseInt(data[1]);
            deffered.resolve(computeUsage(used, total));
        }
    });
    return deffered.promise;
}

exports.currentProcesses = function(callback) {
    var deffered = q.defer();
    ps.get(function(err, processes) {
        if (err) {
            deffered.reject(err);
        } else {
            const sorted = _.sortBy(processes, 'cpu');
            deffered.resolve(sorted);
        }
    });
    return deffered.promise;
}

function getCPUInfo(callback){ 
    var cpus = os.cpus();
	
    var user = 0;
    var nice = 0;
    var sys = 0;
    var idle = 0;
    var irq = 0;
    var total = 0;
	
    for(var cpu in cpus){
		
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }
	
    var total = user + nice + sys + idle + irq;
	
    return {
        'idle': idle, 
        'total': total
    };
}