var EmailTemplates = require('../');
var swig = require('swig-templates');
var assert = require('assert');
var path = require('path');
var Pend = require('pend');
var fs = require('fs');

// Index of tests
// testName: what it should do
var testMap = {
  'simple_vars': 'should do simple variable substitution',
  'rewrite_links': 'should rewrite links',
  'inline_style_tag': 'should inline the contents of style tags',
  'inline_style_link': 'should inline CSS from local CSS using <link>',
  'text_file_alternative': 'should load the text file alternative instead of textifying the HTML',
  'apos': 'should leave quote marks in attributes unprocessed (see issue #34)'
};

// Attempt to
function attemptReadFile(path, encoding, cb) {
  fs.readFile(path, encoding, function(err, text) {
    if (err && err.code === 'ENOENT') {
      err = null;
    }

    cb(err, text);
  });
}

describe('EmailTemplates output', function() {
  var templatePath = path.resolve(__dirname, 'templates');
  var templates = new EmailTemplates({
    juice: {
      webResources: {
        images: false
      }
    },
    root: templatePath,
    rewriteUrl: function(urlString) {
      return urlString + '-append';
    }
  });

  for (var testName in testMap) {
    var should = testMap[testName];
    it(should + ' (' + testName + ')', createIt(testName));
  }

  function createIt(testName) {
    return function(done) {
      this.timeout(4000);

      var testPath = path.join(templatePath, testName);

      var expectedHtml, actualHtml;
      var expectedText, actualText;
      var expectedSubject, actualSubject;

      var pend = new Pend();

      // Read the JSON file & render the HTML
      pend.go(function(cb) {
        attemptReadFile(testPath + '.json', 'utf8', function(err, data) {
          var context = {};

          if (err) return cb(err);
          if (data) context = JSON.parse(data);

          templates.render(testName + '.html', context, function(err, html, text, subject) {
            actualHtml = html;
            actualText = text;
            actualSubject = subject;
            cb(err);
          });
        });
      });

      // Load the expected HTML
      pend.go(function(cb) {
        attemptReadFile(testPath + '.out.html', 'utf8', function(err, html) {
          expectedHtml = html;
          cb(err);
        });
      });

      // Try loading the expected text (may not exist)
      pend.go(function(cb) {
        attemptReadFile(testPath + '.out.txt', 'utf8', function(err, text) {
          expectedText = text;
          cb(err);
        });
      });

      // Try loading the expected text (may not exist)
      pend.go(function(cb) {
        attemptReadFile(testPath + '.out.subject.txt', 'utf8', function(err, subject) {
          expectedSubject = subject;
          cb(err);
        });
      });

      // And when they're all done...
      pend.wait(function(err) {
        if (err) return done(err);

        if (expectedHtml)
          assert.strictEqual(actualHtml.trim(), expectedHtml.trim());
        if (expectedText)
          assert.strictEqual(actualText.trim(), expectedText.trim());
        if (expectedSubject)
          assert.strictEqual(actualText.trim(), expectedText.trim());

        done();
      });
    };
  }
});
