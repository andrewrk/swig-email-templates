# swig-email-templates

Node.js module for rendering beautiful emails with swig templates and
email-friendly inline CSS using [boost](https://github.com/superjoe30/boost).

Inspired by [niftylettuce/node-email-templates](https://github.com/niftylettuce/node-email-templates).

## Features

 * Uses [swig](https://github.com/paularmstrong/swig/), which supports
   [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance).
 * Uses [boost](https://github.com/superjoe30/boost), which takes an HTML
   file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * Ability to generate dummy context from a template to aid in an email
   preview tool.

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
  render('meatball-sandwich', context, function(err, html) {
    // send html email
  });
  generateDummy('meatball-sandwhich', function(err, dummyContext) {
    // dummyContext contains a context you can send to render, prepopulated
    // with dummy values. you can use this if you're building an email
    // preview tool.
  });
});
```
