#!/usr/bin/env node

var fs = require('fs'),
    program = require('commander'),
    ddns = require('../'),
    options;


program
    .version('0.0.1')
    .usage('[options] [value ...]')
    .option('-d, --dns-domain <domain>', 'Set domain name(*required)')
    .option('-H, --dns-host <host>', 'Set host name(*required)')
    .option('-u, --user <user>', 'Set user name(*required)')
    .option('-p, --passwd <password>', 'Set password(*required)')
    .option('-D, --daemon', 'Start as daemon mode')
    .option('-i, --interface <interface>', 'Use IP address of specified network interface')
    .parse(process.argv);

if (!program.dnsDomain) {
    console.log('--dns-domain is required.');
    process.exit(-1);
} else if (!program.dnsHost) {
    console.log('--dns-host is required.');
    process.exit(-1);
} else if (!program.user) {
    console.log('--user is required.');
    process.exit(-1);
} else if (!program.passwd) {
    console.log('--passwd is required.');
    process.exit(-1);
} else {
    options = {
        domain: program.dnsDomain,
        sub_domain: program.dnsHost,
        login_email: program.user,
        login_password: program.passwd,
        is_daemon: program.daemon,
        interface_name: program.interface
    };
    ddns.run(options);
}



