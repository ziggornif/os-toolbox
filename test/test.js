var assert = require('assert');
var ostb = require('..')

describe('os-toolbox', function () {
    describe('#uptime()', function () {
        it('should return uptime without error', function (done) {
            var value = ostb.uptime();
            if (value) {
                done();
            } else {
                done(new Error("Error getting uptime"));
            }
        });
    });

    describe('#platform()', function () {
        it('should return platform without error', function (done) {
            var value = ostb.platform();
            if (value) {
                done();
            } else {
                done(new Error("Error getting platform"));
            }
        });
    });

    describe('#cpuLoad()', function () {
        it('should return cpu load without error', function (done) {
            ostb.cpuLoad().then(function (load) {
                if (load) {
                    done();
                } else {
                    done(new Error("Error getting cpu load"));
                }
            }, function(error){
                done(new Error("Error getting cpu load"));
            });
        });
    });

    describe('#memoryUsage()', function () {
        it('should return memory usage without error', function (done) {
            ostb.memoryUsage().then(function (memusage) {
                if (memusage) {
                    done();
                } else {
                    done(new Error("Error getting memory usage"));
                }
            }, function(error){
                done(new Error("Error getting memory usage"));
            });
        });
    });

    describe('#currentProcesses()', function () {
        it('should return current running processes order by cpu usage without error', function (done) {
            ostb.currentProcesses().then(function (processes) {
                if (processes) {
                    done();
                } else {
                    done(new Error("Error getting current running processes"));
                }
            }, function(error){
                done(new Error("Error getting current running processes"));
            });
        });
    });
});