var DNSUpdater = require('./dnsUpdater'),
    TimeTicker = require('./timeTicker'),
    log4js = require('log4js');

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
    log4js.configure({
        appenders: [
            {
                type: 'console',
                layout: {type: 'basic'}
            }
        ]
    });

    var dnsUpdater = new DNSUpdater(options),
        logger = log4js.getLogger(),
        processErr = function (err) {
            if (err) {
                logger.error(err);
            }
        },
        processLog = function (logInfo) {
            logger.info(logInfo);
        };

    dnsUpdater
        .on('log', processLog)
        .on('fetchRecordValue', processErr)
        .on('updateRecordValue', processErr)
        .on('error', processErr);

    dnsUpdater.prepareDomainInfo().once('prepareDomainInfo', function (err) {
        if (err) {
            logger.error('prepare domainInfo failed with error: %j', err.message);
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
