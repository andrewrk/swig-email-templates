'use strict';

var path = require('path');
var fs = require('fs');
var swig = require('swig-templates');
var juice = require('juice');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');

var EmailTemplates = function(options) {

  var self = this;

  options = options || {}
  options.root = options.root || path.join(__dirname, 'templates');
  options.juice = options.juice || {};
  options.juice.webResources = options.juice.webResources || {};
  options.juice.webResources.relativeTo = options.juice.webResources.relativeTo || options.root;

  swig.setDefaults(options.swig);

  if (options.filters) {
    for (var filter in options.filters) {
      swig.setFilter(filter, options.filters[filter]);
    }
  }

  /*
   * (Internal) Compile and render a swig template
   */
  this.useTemplate = function(templatePath, context) {
    var template = swig.compileFile(templatePath);
    return template(context);
  }

  /*
   * (Internal) Generate text counterpart to HTML template
   */
  this.generateText = function(templatePath, context, html, cb) {
    if (options.hasOwnProperty('text') && !options.text)
      return cb(null, null);

    var textFilename = path.basename(templatePath, path.extname(templatePath)) + '.txt';
    var textPath = path.resolve(path.dirname(templatePath), textFilename);

    fs.exists(textPath, function(exists) {
      if (exists) {
        cb(null, self.useTemplate(textPath, context));
      } else {
        cb(null, htmlToText.fromString(html));
      }
    });
  }

  /*
   * (Internal) Generate text counterpart to HTML template
   */
  this.generateSubject = function(templatePath, context, cb) {

    var textFilename = path.basename(templatePath, path.extname(templatePath)) + '.subject.txt';
    var textPath = path.resolve(path.dirname(templatePath), textFilename);

    fs.exists(textPath, function(exists) {
      if (exists) {
        cb(null, self.useTemplate(textPath, context));
      } else {
        cb(null, null);
      }
    });
  }

  /*
   * (Internal) Rewrite URLs in a Cheerio doc using a given function
   */
  this.rewriteUrls = function($, rewrite) {
    $("a").each(function(idx, anchor) {
      var href = $(anchor).attr('href');
      if (href !== undefined) {
        $(anchor).attr('href', rewrite(href));
      }
    });
  }

  /*
   * Render a template given 'templateName' and context 'context'.
   */
  this.render = function(templateName, context, cb) {
    var templatePath = path.resolve(options.root, templateName);

    context = context || {};

    try {
      var html = self.useTemplate(templatePath, context);
      var $ = cheerio.load(html, { decodeEntities: false });
      if (options.rewriteUrl)
        self.rewriteUrls($, options.rewriteUrl);
      if (options.rewrite)
        options.rewrite($);
    } catch (err) {
      return cb(err);
    }

    // Inline resources
    juice.juiceResources($.html(), options.juice, function(err, inlinedHTML) {
      if (err) return cb(err);

      self.generateText(templatePath, context, html, function(err, text) {
        if (err) return cb(err);

        self.generateSubject(templatePath, context, function(err, subject) {
          if (err) return cb(err);

          cb(null, inlinedHTML, text, subject);
        });
      });
    });
  }
}

module.exports = EmailTemplates;
