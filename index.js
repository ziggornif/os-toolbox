'use strict'
const q = require('q');
require('q-foreach')(q);
const os = require('os');
const _ = require('lodash');
const ps = require('current-processes');
const childProcess = require('child_process')

exports.platform = function() {
    return process.platform;
}

exports.uptime = function() {
    return os.uptime();
}

exports.cpuLoad = () => {
    let deffered = q.defer();
    let beforeCpuInfos;
    getCPUInfo().then(result => {
        beforeCpuInfos = result;
        return q.delay(1000);
    }).then(() =>{
        return getCPUInfo();
    }).then(afterCpuInfos =>{
        let idle = afterCpuInfos.idle - beforeCpuInfos.idle;
        let total = afterCpuInfos.total - beforeCpuInfos.total;
        let perc = idle / total;
        deffered.resolve(Math.floor((1 - perc) * 100));
    });

    return deffered.promise;
}

exports.memoryUsage = () => {
    let deffered = q.defer();
    let computeUsage = (used, total) => {
        return Math.round(100 * (used / total));
    };

    //Windows platform
    if (process.platform === 'win32') {
        q.all([
            winGetFreeMemory(),
            winGetTotalMemory()
        ]).then(results => {
            deffered.resolve(100 - computeUsage(results[0], results[1]));
        }, err => {
            deffered.reject(err);
        });
        //MacOSX platform
    } else if (process.platform === "darwin") {
        childProcess.exec('memory_pressure | grep "System-wide memory free percentage: "', (err, stdout) => {
            if (err) {
                deffered.reject(err);
            } else {
                let data = stdout.replace('%', '').replace(/[\s\n\r]+/g, ' ').split(' ');
                deffered.resolve(data[4]);
            }
        });
        //Linux platform
    } else {
        childProcess.exec('free -m', (err, stdout) => {
            if (err) {
                deffered.reject(err);
            } else {
                let data = stdout.split('\n')[1].replace(/[\s\n\r]+/g, ' ').split(' ');
                let used = parseInt(data[2]);
                let total = parseInt(data[1]);
                deffered.resolve(computeUsage(used, total));
            }
        });
    }

    return deffered.promise;
}

exports.currentProcesses = sort => {
    let deffered = q.defer();
    let currentproc = [];
    ps.get((err, processes) => {
        if (err) {
            deffered.reject(err);
        } else {
            processes.forEach(proc => {
                let process = {};
                process.pid = proc.pid;
                process.name = proc.name;
                process.cpu = proc.cpu;
                process.mem = proc.mem.usage;
                currentproc.push(process);
            });
            if (sort) {
                const sorted = _.orderBy(currentproc, [sort.type], [sort.order]);
                deffered.resolve(sorted);
            } else {
                deffered.resolve(currentproc);
            }
        }
    });
    return deffered.promise;
}

exports.services = filters => {
    let deffered = q.defer();
    let listeServices = [];
    if (process.platform === 'linux') {
        childProcess.exec('service --status-all', (err, stdout) => {
            if (err) {
                deffered.reject(err);
            } else {
                let result = stdout.split('\n');
                result.splice(-1, 1);
                result.forEach(line => {
                    let data = line.split(']');
                    let service = {};
                    service.name = data[1].trim();
                    service.runing = (data[0].trim().substring(2, 3) === '+') ? true : false;
                    listeServices.push(service);
                });

                if (filters) {
                    let filteredServices = [];
                    filters.forEach(filter => {
                        filteredServices.push(_.find(listeServices, filter));
                    });
                    deffered.resolve(filteredServices);
                } else {
                    deffered.resolve(listeServices);
                }
            }
        });
    } else {
        deffered.reject(new Error("Unsuported platform"));
    }
    return deffered.promise;
}

function getCPUInfo() {
    let deffered = q.defer();
    const cpus = os.cpus();

    let user = 0,
        nice = 0,
        sys = 0,
        idle = 0,
        irq = 0,
        total = 0;

    q.forEach(cpus, cpu => {
        let defer = q.defer();
        user += cpu.times.user;
        nice += cpu.times.nice;
        sys += cpu.times.sys;
        irq += cpu.times.irq;
        idle += cpu.times.idle;
        defer.resolve();
        return defer.promise;
    }).then(() => {
        total = user + nice + sys + idle + irq;
        deffered.resolve({
            'idle': idle,
            'total': total
        })
    });
    return deffered.promise;
}

function winGetFreeMemory() {
    let deffered = q.defer();
    childProcess.exec('wmic os get freephysicalmemory /format:value', function(err, stdout) {
        if (err) {
            deffered.reject(err);
        } else {
            let used = parseInt(stdout.split('\n')[2].split('=')[1]);
            deffered.resolve(used);
        }
    });
    return deffered.promise;
}

function winGetTotalMemory() {
    let deffered = q.defer();
    childProcess.exec('wmic os get TotalVisibleMemorySize /format:value', function(err, stdout) {
        if (err) {
            deffered.reject(err);
        } else {
            let used = parseInt(stdout.split('\n')[2].split('=')[1]);
            deffered.resolve(used);
        }
    });
    return deffered.promise;
}
