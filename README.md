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

## Release Notes

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
