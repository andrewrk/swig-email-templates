#!/usr/bin/env node

var EmailTemplates = require('../index.js');
var optimist = require('optimist');
var fs = require('fs');
var path = require('path');

var opts = optimist
    .usage('\n Usage:\n' +
      '    $0 [files] [options]\n'
      )
    .describe({
      v: 'Show the swig-email-templates version number.',
      o: 'Output location.',
      r: 'Root location of your templates.',
      h: 'Show this help screen.',
      j: 'Variable context as a JSON file.',
      c: 'Variable context as a CommonJS-style file, if -j not provided'
    })
    .alias('v', 'version')
    .alias('o', 'output')
    .default('o', 'stdout')
    .alias('h', 'help')
    .alias('j', 'json')
    .alias('c', 'context')
    .alias('r', 'root')
    .default('r', '.')
    .check(function(argv) {
      if (argv.v) {
        return;
      }

      if (!argv._.length || argv.h) {
        optimist.showHelp();
        process.exit(0);
      }
    });

var argv = opts.argv;

// Version number
if (argv.v) {
  console.log(require('../package').version);
  process.exit(0);
}

// JSON input
var ctx;
if (argv.j) {
  ctx = JSON.parse(fs.readFileSync(argv.j, 'utf8'));
} else if (argv.c) {
  ctx = require(argv.c);
}

// Output location
var out;
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

  out = function(file, str, filetype) {
    if (typeof filetype !== 'undefined') {
      file = file.replace(/\.[^/.]+$/, '') + filetype;
    } else {
      file = path.basename(file);
    }
    fs.writeFileSync(argv.o + file, str);
    console.log('Wrote', argv.o + file);
  };
} else {
  out = function(file, str) {
    console.log(str);
  }
}

// Template root
var root = '.';
if (argv.r && argv.r !== 'templates') {
  root = path.normalize(argv.r);
}

var templates = new EmailTemplates({ root: root });

argv._.forEach(function(file) {
  templates.render(file, ctx, function(err, html) {
    if (err) {
      console.log(err);
    } else {
      out(file, html);
    }
  });
});
