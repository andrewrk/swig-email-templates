'use strict';

var path = require('path');
var fs = require('fs');
var swig = require('swig');
var juice = require('juice');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');

/*
 * options can contain:
 * - root (String): specifies the root for templates
 * - urlRewrite (function (String url) => String): each url in the document wil have is href set to the return of this function
 */
var EmailTemplates = function (options) {

  var self = this;

  options = options || {}
  options.root = options.root || path.join(__dirname, 'templates');
  options.juice = options.juice || {};
  options.juice.webResources = options.juice.webResources || {};
  options.juice.webResources.images = options.juice.webResources.images || false;

  swig.setDefaults(options.swig);

  /*
   * (Internal) Compile and render a swig template
   */
  this.useTemplate = function (templatePath, context) {
    var template = swig.compileFile(templatePath);
    return template(context);
  }


  /*
   * (Internal) Generate text counterpart to HTML template
   */
  this.generateText = function (templatePath, context, html, cb) {
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
   * (Internal) Rewrite URLs in a Cheerio doc using a given function
   */
  this.rewriteUrls = function ($, rewrite) {
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
  this.render = function (templateName, context, cb) {
    var templatePath = path.resolve(options.root, templateName);

    context = context || {};
    options.juice.webResources.relativeTo = options.juice.webResources.relativeTo || options.root;

    var html = self.useTemplate(templatePath, context);
    var $ = cheerio.load(html);
    if (options.rewriteUrl)
      self.rewriteUrls($, options.rewriteUrl);

    // Inline resources
    juice.juiceResources($.html(), options.juice, function(err, inlinedHTML) {
      if (err) return cb(err);

      self.generateText(templatePath, context, html, function(err, text) {
        if (err) return cb(err);

        cb(null, inlinedHTML, text);
      });
    });
  }
}

module.exports = EmailTemplates;
