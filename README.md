[![Build Status](https://travis-ci.org/superjoe30/swig-email-templates.png?branch=master)](https://travis-ci.org/superjoe30/swig-email-templates)
# swig-email-templates

Node.js module for rendering beautiful emails with swig templates and
email-friendly inline CSS using [juice](https://github.com/LearnBoost/juice).

Inspired by [niftylettuce/node-email-templates](https://github.com/niftylettuce/node-email-templates).

## Features

 * Uses [swig](https://github.com/paularmstrong/swig/), which supports
   [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance).
 * Uses [juice](https://github.com/LearnBoost/juice), which takes an HTML
   file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * Uses [swig-dummy-context](https://github.com/superjoe30/swig-dummy-context)
   which gives you the ability to generate dummy context from a template to
   aid in an email preview tool.
 * URL rewrite support - you can provide a `urlRewriteFn` argument to rewrite
   your links.

## Usage

```js
var path = require('path')
  , emailTemplates = require('swig-email-templates')

var options = {
  root: path.join(__dirname, "templates"),
  // any other swig options allowed here
};
emailTemplates(options, function(err, render, generateDummy) {
  var context = {
    meatballCount: 9001,
  };
  render('meatball-sandwich.html', context, function(err, html) {
    // send html email
  });
  generateDummy('meatball-sandwich.html', function(err, dummyContext) {
    // dummyContext contains a context you can send to render, prepopulated
    // with dummy values. you can use this if you're building an email
    // preview tool.
  });
});
```

## Command Line

Installing swig-email-templates through npm will put the `swig-email-templates` command in your system path, allowing it to be run from any directory.

Usage:

```
swig-email-templates render [files] [options]
swig-email-templates generateDummy [files] [options]
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

The following examples renders two files, `email1.html` and `email2.html`, both contained in the cwd using the context stored in `context/main.json`. The results are placed in the folder `output`.

```
swig-email-templates render email1.html email2.html -r ./ -o output/ -j context/main.json
```

Generating dummy context is hardly any different. The output of this function is the dummy context itself, in JSON format. The name given to the context is the 

In this case, we generate the dummy context for a file, `email.html`, and place it in the directory `dummy`. The generated file has the same name as the input file, but uses the `.json` file extension. So, in this example, we will generate `dummy/about.json`.

```
swig-email-templates render index.html about.html -r ./ -o dummy/
```


## Release Notes

### 0.6.0

 * updated swig to 0.14.0

### 0.5.1

 * updated juice to 0.4.0

### 0.5.0

 * **BREAKING CHANGE** - `render` and `generateDummy` no longer automatically append
   `.html` to your template name to look it up. This means that if you before had
   `render('meatball-sandwich')` you must change it to
   `render('meatball-sandwich.html')` to work with 0.5.0.
 * fixed crash during cleanup
 * updated juice to 0.3.2
 * updated jsdom to 0.5.4
