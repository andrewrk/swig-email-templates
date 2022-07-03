#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const EmailTemplates = require('../index.js')

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [files] [options]')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .describe('o', 'Output location')
    .alias('o', 'output')
    .describe('r', 'Root location of your templates')
    .alias('r', 'root')
    .describe('j', 'Variable context as a JSON file')
    .alias('j', 'json')
    .describe(
        'c',
        'Variable context as a CommonJS-style file, if -j not provided'
    )
    .alias('c', 'context')
    .default('o', 'stdout')
    .default('r', '.')
    .check((argv) => {
        if (argv._.length === 0) {
            throw new Error('** You must provide files to process')
        }

        return true
    })
    .argv

// Version number
if (argv.v) {
    console.log(require('../package').version)
    process.exit(0)
}

// JSON input
let ctx
if (argv.j) {
    ctx = JSON.parse(fs.readFileSync(argv.j, 'utf8'))
} else if (argv.c) {
    ctx = require(argv.c)
}

// Output location
let out
if (argv.o !== 'stdout') {
    argv.o += '/'
    argv.o = path.normalize(argv.o)

    try {
        fs.mkdirSync(argv.o)
    } catch (e) {
        if (e.errno !== 47) {
            throw e
        }
    }

    out = function (file, str, filetype) {
        if (typeof filetype !== 'undefined') {
            file = file.replace(/\.[^/.]+$/, '') + filetype
        } else {
            file = path.basename(file)
        }
        fs.writeFileSync(argv.o + file, str)
        console.log('Wrote', argv.o + file)
    }
} else {
    out = function (file, str) {
        console.log(str)
    }
}

const templates = new EmailTemplates({
    root: argv.r && argv.r !== 'templates' ? path.normalize(argv.r) : '.',
})

argv._.forEach(function (file) {
    templates.render(file, ctx, function (err, html) {
        if (err) {
            console.log(err)
        } else {
            out(file, html)
        }
    })
})
