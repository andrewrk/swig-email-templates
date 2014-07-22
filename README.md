[![Build Status](https://travis-ci.org/andrewrk/swig-email-templates.png?branch=master)](https://travis-ci.org/andrewrk/swig-email-templates)
# swig-email-templates

Node.js module for rendering emails with swig templates and
email-friendly inline CSS using [juice](https://github.com/LearnBoost/juice).

Inspired by [niftylettuce/node-email-templates](https://github.com/niftylettuce/node-email-templates).

## Features

 * Uses [swig](https://github.com/paularmstrong/swig/), which supports
   [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance).
 * Uses [juice](https://github.com/LearnBoost/juice), which takes an HTML
   file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * URL rewrite support - you can provide a `urlRewriteFn` argument to rewrite
   your links.
 * Text emails - for a template name passed into render(), if a file exists 
   with the same name but a .txt extension it will be rendered separately.
   If the .txt file does not exist, html-to-text will auto-generate a text 
   version of the html file. This can be disabled with the option `text: false`.

## Usage

```js
var path = require('path')
  , emailTemplates = require('swig-email-templates')

var options = {
  root: path.join(__dirname, "templates"),
  // any other swig options allowed here
};
emailTemplates(options, function(err, render) {
  var context = {
    meatballCount: 9001,
  };
  render('meatball-sandwich.html', context, function(err, html, text) {
    // send html/text email
  });
});
```

## Command Line

Installing swig-email-templates through npm will put the `swig-email-templates` command in your system path, allowing it to be run from any directory.

#### Usage

```
swig-email-templates render [files] [options]
```

Where `[files]` can be any number of input files to process.

The options are:

* **-v, --version**: Display the installed version of swig-email-templates
* **-h, --help**: Show the help screen
* **-o --output**: The directory to output your files to. Defaults to `stdout`
* **-r, --root**: The root location for the files. The default is `templates`.

* **-j, --json**: The file that contains your context, stored in JSON
* **-c, --context**: The file that contains your context, stored as a CommonJS module. Used only if `-j` is not provided.

### Example usage

The following examples renders two files, `email1.html` and `email2.html`, which are both contained in the cwd. It uses the context stored in `context/main.json` for rendering, and places the results in the folder `output`.

```
swig-email-templates render email1.html email2.html -r ./ -o output/ -j context/main.json
```
