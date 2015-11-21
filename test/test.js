var emailTemplates = require('../');
var createDummyContext = emailTemplates.createDummyContext;
var swig = require('swig');
var assert = require('assert');
var path = require('path');
var Pend = require('pend');
var fs = require('fs');

// Index of tests
// testName: what it should do
var testMap = {
  'simple_vars': 'should do simple variable substitution',
  'two_vars_content': 'two_vars_content',
  'for_loop': 'for_loop',
  'if_statement': 'if_statement',
  'comments': 'comments',
  'complex_variable': 'complex_variable',
  'plays': 'plays'
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

describe("swig-email-templates", function() {
  var render;
  var templatePath = path.join(__dirname, "templates");

  before(function(cb) {
    var options = {
      root: templatePath
    };

    emailTemplates(options, function(err, renderFn) {
      if (err) {
        cb(err);
      } else {
        render = renderFn;
        cb();
      }
    });
  });

  for (var testName in testMap) {
    var should = testMap[testName];
    it(should + ' (' + testName + ')', createIt(testName));
  }
  
  function createIt(testName) {
    return function(cb) {
      var testPath = path.join(templatePath, testName);

      var expectedHtml, actualHtml;
      var expectedText, actualText;

      var pend = new Pend();

      // Read the JSON file & render the HTML
      pend.go(function(cb) {
        attemptReadFile(testPath + '.json', 'utf8', function(err, data) {
          var context = {};

          if (err) return cb(err);
          if (data) context = JSON.parse(data);

          render(testName + '.html', context, rewrite, function(err, html, text) {
            actualHtml = html;
            actualText = text;
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

      // And when they're all done...
      pend.wait(function(err) {
        if (err) return cb(err);

        assert.strictEqual(actualHtml.trim(), expectedHtml.trim());
        if (expectedText) {
          assert.strictEqual(actualText.trim(), expectedText.trim());
        }
        cb();
      });
    };
  }
});

function rewrite(urlString) {
  return urlString + "-append";
}
