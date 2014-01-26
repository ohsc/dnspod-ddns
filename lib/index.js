var DNSUpdater = require('./dnsUpdater'),
    TimeTicker = require('./timeTicker');

function runAsDaemon(updater) {
    var ticker = new TimeTicker(60 * 1000, 5 * 60 * 1000);
    ticker.on('tick', function () {
        updater.updateRecordValue();
    });
    ticker.on('wideTick', function () {
        updater.fetchRecordValue();
    });
}


function run(options) {
    var dnsUpdater = new DNSUpdater(options),
        processErr = function (err) {
            if (err) {
                console.error(err);
            }
        },
        processLog = function (logInfo) {
            console.log(logInfo);
        };

    dnsUpdater
        .on('log', processLog)
        .on('fetchRecordValue', processErr)
        .on('updateRecordValue', processErr)
        .on('error', processErr);

    dnsUpdater.prepareDomainInfo().once('prepareDomainInfo', function (err) {
        if (err) {
            console.error('prepare domainInfo failed with error: %j', err.message);
        } else if (options.is_daemon) {
            runAsDaemon(dnsUpdater);
        } else {
            dnsUpdater.updateRecordValue();
        }
    });
}

module.exports = {
    run: run,
    DNSUpdater: DNSUpdater
};
