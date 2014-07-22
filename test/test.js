var emailTemplates = require('../');
var createDummyContext = emailTemplates.createDummyContext;
var swig = require('swig');
var assert = require('assert');
var path = require('path');
var Pend = require('pend');
var fs = require('fs');

var testMap = {
  "simple_vars": {
    hello: "hello"
  },
  "two_vars_content": {
    one: "one",
    two: "two"
  },
  "for_loop": {
    scalar: "scalar",
    scalar2: "scalar2",
    xyz: [ "abcd" ],
    lalala: "lalala"
  },
  "plays": {
    subject: "subject",
    emailPreferencesUrl: "emailPreferencesUrl",
    userImgUrl: "userImgUrl",
    playCount: "playCount",
    commentCount: "commentCount",
    voteCount: "voteCount",
    facebookShareUrl: "facebookShareUrl",
    twitterShareUrl: "twitterShareUrl",
    userName: "userName",
    opportunityListenUrl: "opportunityListenUrl",
    submissionStatsUrl: "submissionStatsUrl"
  },
  "if_statement": {
    one: "one",
    two: "two",
    three: "three",
    four: "four",
    five: "five",
    foo: "foo",
    derp: "derp"
  },
  "comments": {
    twenty: "twenty",
    ten: "ten",
    eleven: "eleven",
    baseOne: "baseOne",
    baseTwo: "baseTwo"
  },
  "complex_variable": {
    scalar: "scalar",
    one: {
      two: {
        three: "three",
        four: "four"
      },
      five: {
        four: "four"
      },
      six: "six"
    },
    foo: {
      bar: "bar",
      arr: [{
        prop: [{
          prop2: "prop2"
        }]
      }]
    },
    xyz: [[
      {
        one: "one",
        two: "two"
      }
    ]],
    lalala: "lalala",
    la2: "la2"
  }
};

describe("swig-email-templates", function() {
  var render;
  before(function(cb) {
    var options = {
      root: path.join(__dirname, "templates")
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

  for (var templateName in testMap) {
    it(templateName, createIt(templateName, testMap[templateName]));
  }
  
  function createIt(templateName, context) {
    return function(cb) {
      var pend = new Pend();
      var expectedHtml, actualHtml;
      var expectedText, actualText;
      pend.go(function(cb) {
        render(templateName + '.html', context, rewrite, function(err, html, text) {
          actualHtml = html;
          actualText = text;
          cb(err);
        });
      });
      pend.go(function(cb) {
        var filename = path.join(__dirname, "templates", templateName + ".out.html");
        fs.readFile(filename, 'utf8', function(err, val) {
          expectedHtml = val;
          cb(err);
        });
      });
      pend.go(function(cb) {
        var filename = path.join(__dirname, "templates", templateName + ".out.txt");
        fs.readFile(filename, 'utf8', function(err, val) {
          if (err) {
            if (err.code === 'ENOENT') {
              expectedText = null;
              cb();
            } else {
              cb(err);
            }
          } else {
            expectedText = val;
            cb();
          }
        });
      });
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
