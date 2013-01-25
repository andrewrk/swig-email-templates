var emailTemplates = require('../')
  , createDummyContext = emailTemplates.createDummyContext
  , swig = require('swig')
  , assert = require('assert')
  , path = require('path')
  , Batch = require('batch')
  , fs = require('fs')

swig.init({
  allowErrors: true,
  root: path.join(__dirname, "templates"),
});
var testMap = {
  "simple_vars": {
    hello: "hello",
  },
  "two_vars_content": {
    one: "one",
    two: "two",
  },
  "for_loop": {
    scalar: "scalar",
    scalar2: "scalar2",
    xyz: [ "abcd" ],
    lalala: "lalala",
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
    submissionStatsUrl: "submissionStatsUrl",
  },
  "if_statement": {
    one: "one",
    two: "two",
    three: "three",
    four: "four",
    five: "five",
    foo: "foo",
    derp: "derp",
  },
};

describe("createDummyContext", function() {
  for (var templateName in testMap) {
    it(templateName, createIt(templateName, testMap[templateName]));
  }
  
  function createIt(templateName, expected) {
    return function() {
      var template = swig.compileFile(templateName + ".html");
      assert.deepEqual(createDummyContext(template), expected);
    };
  }
});

describe("swig-email-templates", function() {
  var render, dummyContext;
  before(function(cb) {
    var options = {
      root: path.join(__dirname, "templates"),
    };
    emailTemplates(options, function(err, renderFn, dummyContextFn) {
      if (err) {
        cb(err);
      } else {
        render = renderFn;
        dummyContext = dummyContextFn;
        cb();
      }
    });
  });

  for (var templateName in testMap) {
    it(templateName, createIt(templateName));
  }
  
  function createIt(templateName) {
    return function(cb) {
      var batch = new Batch();
      batch.push(function(cb) {
        dummyContext(templateName, function(err, context) {
          if (err) return cb(err);
          render(templateName, context, cb);
        });
      });
      batch.push(function(cb) {
        var filename = path.join(__dirname, "templates", templateName + ".out.html");
        fs.readFile(filename, 'utf8', cb);
      });
      batch.end(function(err, results) {
        if (err) return cb(err);
        assert.strictEqual(results[0], results[1].trim());
        cb();
      });
    };
  }
});
