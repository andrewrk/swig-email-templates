#!/usr/bin/env node

var emailTemplates = require('../index.js'),
    optimist = require('optimist'),
    fs = require('fs'),
    path = require('path'),
    command,
    root,
    argv = optimist
    .usage('\n Usage:\n' +
      '    $0 render [files] [options]\n'
      )
    .describe({
      v: 'Show the swig-email-templates version number.',
      o: 'Output location.',
      r: 'Root location of your templates.',
      h: 'Show this help screen.',
      j: 'Variable context as a JSON file.',
      c: 'Variable context as a CommonJS-style file. Used only if option `j` is not provided.'
    })
    .alias('v', 'version')
    .alias('o', 'output')
    .default('o', 'stdout')
    .alias('h', 'help')
    .alias('j', 'json')
    .alias('c', 'context')
    .alias('r', 'root')
    .default('r', 'templates')
    .check(function (argv) {
      if (argv.v) {
        return;
      }

      if (!argv._.length || argv.h) {
        optimist.showHelp();
        process.exit(0);
      }

      command = argv._.shift();
      if (command !== 'render') {
        throw new Error('Unrecognized command "' + command + '". Use -h for help.');
      }
    })
    .argv,
    ctx = {},
    out = function (file, str) {
      console.log(str);
    },
    fn;

if (argv.v) {
  console.log(require('../package').version);
  process.exit(0);
}

if (argv.j) {
  ctx = JSON.parse(fs.readFileSync(argv.j, 'utf8'));
} else if (argv.c) {
  ctx = require(argv.c);
}

if (argv.o !== 'stdout') {
  argv.o += '/';
  argv.o = path.normalize(argv.o);

  try {
    fs.mkdirSync(argv.o);
  } catch (e) {
    if (e.errno !== 47) {
      throw e;
    }
  }

  out = function (file, str, filetype) {
    if (typeof filetype !== "undefined") {
      file = file.replace(/\.[^/.]+$/, "") + filetype;
    } else {
      file = path.basename(file);
    }
    fs.writeFileSync(argv.o + file, str);
    console.log('Wrote', argv.o + file);
  };
}

if (argv.r && argv.r !== 'templates') {
  argv.r = path.normalize(argv.r);
  root = argv.r;
}

switch (command) {

  case 'render':
    fn = function (file, str) {
      var options = {
        root: argv.r
      };
      emailTemplates(options, function(err, render) {
        render(file, ctx, function(err, html) {
          if (err) {
            console.log(err);
          } else {
            out(file, html);
          }
        });
      });
    };
    break;

}

argv._.forEach(function (file) {
  var str = fs.readFileSync(file, 'utf8');
  fn(file, str);
});
