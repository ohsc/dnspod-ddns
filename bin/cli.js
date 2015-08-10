#!/usr/bin/env node

var fs = require('fs'),
    program = require('commander'),
    packageInfo = require('../package.json'),
    ddns = require('../'),
    options;


program
    .version(packageInfo.version)
    .usage('[options] [value ...]')
    .option('-d, --dns-domain <domain>', 'Set domain name(*required)')
    .option('-H, --dns-host <host>', 'Set host name(*required)')
    .option('-u, --user <user>', 'Set user name(*required)')
    .option('-p, --passwd <password>', 'Set password(*required)')
    .option('-t, --login-token <token>','Set Login Token(*required)')
    .option('-D, --daemon', 'Start as daemon mode')
    .option('-i, --interface <interface>', 'Use IP address of specified network interface')
    .parse(process.argv);

if (!program.dnsDomain) {
    console.log('--dns-domain is required.');
    process.exit(-1);
} else if (!program.dnsHost) {
    console.log('--dns-host is required.');
    process.exit(-1);
} else {
     options = {
        domain: program.dnsDomain,
        sub_domain: program.dnsHost,
        is_daemon: program.daemon,
        interface_name: program.interface
    };

     if (program.loginToken) {
         options.login_token = program.loginToken;
     } else if (program.user && program.passwd) {
       options.login_email = program.user;
       options.login_password = program.passwd;
     } else {
        console.log( '--login-token or --user with --passwd is required.');
        process.exit(-1);
     }
      ddns.run(options);
}
