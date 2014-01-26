var EventEmitter = require('events').EventEmitter,
    util = require('util');

function TimeTicker(interval, wideInterval) {
    var self = this,
        count = 0,
        len = wideInterval / interval,
        nextTicker = function () {
            if (count === 0) {
                self.emit('wideTick');
            }
            self.emit('tick');
            count = (count + 1) % len;
            setTimeout(nextTicker, interval);
        };
    process.nextTick(nextTicker);
}
util.inherits(TimeTicker, EventEmitter);

module.exports = TimeTicker;
