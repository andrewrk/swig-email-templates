var EmailTemplates = require('../');
var assert = require('assert');
var cheerio = require('cheerio');

describe('EmailTemplates', function() {
  describe('constructor', function() {
    it('should return an object', function() {
      var templates = new EmailTemplates();
      assert.equal(Object.prototype.toString(templates), "[object Object]");
    });

    it('swig filters should work', function() {
      var templates = new EmailTemplates({
        root: "test/templates/",
        text: false,
        filters: {
          whereproof: function() {
            return 'the proof is in the pudding';
          }
        }
      });

      templates.render('filter.html', null, function(err, html, text) {
        assert.equal(html, 'the proof is in the pudding');
      });
    });
  });

  describe('render', function() {
    it("should feed errors through callback (nonexistent templates)", function(done) {
      var templates = new EmailTemplates();
      templates.render('nonexistent', null, function(err, html, text) {
        assert.equal(err.code, 'ENOENT');
        done();
      });
    });

    it("should return convert HTML to text if no text alternative file is present", function(done) {
      var templates = new EmailTemplates({
        root: "test/templates/"
      });

      templates.render('no_text_file_alternative.html', null, function(err, html, text) {
        assert.equal(text, 'This is a message with bold , just a tester.');
        done(err);
      });
    });

    it("should respect disabling HTML-to-text", function(done) {
      var templates = new EmailTemplates({
        root: "test/templates/",
        text: false
      });

      templates.render('text_file_alternative.html', null, function(err, html, text) {
        assert.equal(text, null);
        done(err);
      });
    });
  });

  describe('rewriteUrls', function() {

    it('should always pass strings to rewriteUrl function', function() {
      var $ = cheerio.load("<a>testing</a> <a href=''>testing-2</a>");
      var templates = new EmailTemplates();

      templates.rewriteUrls($, function(url) {
        assert.equal(typeof url, "string");
      });
    });

  });
})
