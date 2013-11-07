var async = require('async'),
    Dnspod = require('dnspod-client'),
    TimeTicker = require('./timeTicker');

function ctxFilter(paramsArr, extObj) {
    var subCtx = {},
        self = this;
    paramsArr.forEach(function (key) {
        if (self[key]) {
            subCtx[key] = self[key];
        }
    });

    if (extObj) {
        Object.keys(extObj).forEach(function (key) {
            subCtx[key] = extObj[key];
        });
    }

    return subCtx;
}

function updateIp(context, doneFn) {
    var params = ctxFilter.bind(context),
        client = new Dnspod(params(['login_email', 'login_password']));

    async.waterfall([
        function (callback) {
            client
                .recordList(params(['domain_id', 'sub_domain'], {length: 5}))
                .on('recordList', callback);
        },
        function (result, callback) {
            if (result.status.code === "1") {
                if (result.records.length > 0) {
                    context.record_id = result.records[0].id;
                    context.record_value = result.records[0].value;
                    callback(null);
                } else {
                    callback(new Error('Can not found any matched host.'));
                }
            } else {
                callback(new Error(result.status.message));
            }
        }
    ], function (err) {
        if (err) {
            console.log(err);
        }
        if (doneFn) {
            doneFn(err);
        }
    });
}

function requestIds(context, doneFn) {
    var params = ctxFilter.bind(context),
        client = new Dnspod(params(['login_email', 'login_password']));
    async.waterfall([
        function (callback) {
            //request domain id
            client
                .domainInfo(params(['domain']))
                .on('domainInfo', callback);
        },
        function (result, callback) {
            if (result.status.code === "1") {
                //export to global
                context.domain_id = result.domain.id;
                callback(null);
            } else {
                callback(new Error(result.status.message));
            }
        },
        function (callback) {
            updateIp(context, callback);
        }
    ], doneFn);
}

function updateDdns(context, doneFn) {
    var params = ctxFilter.bind(context),
        client = new Dnspod(params(['login_email', 'login_password']));

    async.waterfall([
        function (callback) {
            if(context.is_localip){
                var interfaces = require('os').networkInterfaces();
                var targetIp;
                for(var interface in interfaces){
                    if(interfaces.hasOwnProperty(interface)){
                        interfaces[interface].forEach(function(ip){
                            if(ip.family === 'IPv4' && ip.address !== '127.0.0.1'){
                                targetIp = ip.address;
                            }
                        });
                    }
                }
                setTimeout(function(){
                    callback(null,targetIp);
                },0);
            }else{
                client
                    .getHostIp()
                    .on('getHostIp', callback);                
            }
        },
        function (result, callback) {
            var oldIp = context.record_value;

            console.log('Old ip address is %j, while new ip address is %j', oldIp, result);

            if (result !== oldIp) {
                //export to global
                context.record_value = result;
                context.value = result;
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        function (result, callback) {
            if (result) {
                client
                    .recordModify(params([
                        'domain_id',
                        'record_id',
                        'sub_domain',
                        'record_line',
                        'record_type',
                        'value'
                    ]))
                    .on('recordModify', callback);
            }
        }
    ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
        if (doneFn) {
            doneFn(err, result);
        }
    });
}

function runAsDaemon(context) {
    var ticker = new TimeTicker(60 * 1000, 5 * 60 * 1000);
    ticker.on('tick', function () {
        updateDdns(context, function (err, result) {
            if (err) {
                process.exit(-1);
            }
        });
    });
    ticker.on('wideTick', function () {
        updateIp(context, function (err, result) {
            if (err) {
                process.exit(-1);
            }
        });
    });
}

function run(options) {
    var context = {
        domain: options.domain,
        sub_domain: options.sub_domain,
        login_email: options.login_email,
        login_password: options.login_password,
        is_localip:options.is_localip,
        domain_id: '',
        record_id: '',
        record_value: '',
        record_line: '默认',
        record_type: 'A'
    };
    requestIds(context, function (err, result) {
        if (err) {
            console.log('request ids failed with error: %j', err.message);
        } else {
            if (options.is_daemon) {
                runAsDaemon(context);
            } else {
                updateDdns(context);
            }
        }
    });
}

module.exports = {
    requestIds: requestIds,
    updateDdns: updateDdns,
    run: run
};