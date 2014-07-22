var swig = require("swig");
var juiceDocument = require("juice2").juiceDocument;
var path = require("path");
var jsdom = require("jsdom");
var fs = require('fs');
var htmlToText = require("html-to-text");
var rootFolder = path.join(__dirname, "templates");

module.exports = init;

function init(options, cb) {
  rootFolder = options.root || rootFolder;

  swig.setDefaults(options);
  cb(null, render);
    
  function render(templateName, context, urlRewriteFn, cb) {
    if (! cb) {
      cb = urlRewriteFn;
      urlRewriteFn = null;
    }
    // compile file into swig template
    compileTemplate(templateName, function(err, template) {
      if (err) return cb(err);
      // render template with context
      renderTemplate(template, context, function(err, html) {
        if (err) return cb(err);
        createJsDomInstance(html, function(err, document) {
          if (err) return cb(err);
          if (urlRewriteFn) rewriteUrls(document, urlRewriteFn);
          var fileUrl = "file://" + path.resolve(process.cwd(), path.join(options.root, templateName));
          options.juice = options.juice || {};
          options.juice.url = fileUrl;
          juiceDocument(document, options.juice, function(err) {
            if (err) {
              // free the associated memory
              // with lazily created parentWindow
              tryCleanup();
              cb(err);
            } else {
              var inner = document.innerHTML;
              tryCleanup();
              generateText(options, context, inner, function(err, text) {
                if (err) return cb(err);
                cb(null, inner, text);
              });
            }
            function tryCleanup() {
              try {
                document.parentWindow.close();
              } catch (cleanupErr) {}
              try {
                document.close();
              } catch (cleanupErr) {}
            }
          });
        });
      });
    });
  }
}

function rewriteUrls(document, rewrite, cb) {
  var anchorList = document.getElementsByTagName("a");
  for (var i = 0; i < anchorList.length; ++i) {
    var anchor = anchorList[i];
    for (var j = 0; j < anchor.attributes.length; ++j) {
      var attr = anchor.attributes[j];
      if (attr.name.toLowerCase() === 'href') {
        anchor.setAttribute(attr.name, rewrite(attr.value));
        break;
      }
    }
  }
}

function createJsDomInstance(content, cb) {
  // hack to force jsdom to see this argument as html content, not a url
  // or a filename. https://github.com/tmpvar/jsdom/issues/554
  var html = content + "\n";
  var options = {
    features: {
      QuerySelector: ['1.0'],
      FetchExternalResources: false,
      ProcessExternalResources: false,
      MutationEvents: false
    }
  };
  try {
    cb(null, jsdom.html(html, null, options));
  } catch (err) {
    cb(err);
  }
}

function generateText(options, context, html, cb) {
  if (options.hasOwnProperty('text') && !options.text) return cb(null, null);
  var fileUrl = options.juice.url;
  var txtName = path.basename(fileUrl, path.extname(fileUrl)) + ".txt";
  var txtUrl = path.join(path.dirname(options.juice.url.slice(7)), txtName);
  fs.exists(txtUrl, function(exists) {
    if (exists) {
      compileTemplate(txtName, function(err, template) {
        renderTemplate(template, context, cb);
      });
    } else {
      cb(null, htmlToText.fromString(html));
    }
  });
}

function compileTemplate(name, cb) {
  try {
    cb(null, swig.compileFile(path.join(rootFolder, name)));
  } catch (err) {
    cb(err);
  }
}

function renderTemplate(template, context, cb) {
  try {
    cb(null, template(context));
  } catch (err) {
    cb(err);
  }
}

var owns = {}.hasOwnProperty;
function extend(obj, src) {
  for (var key in src) if (owns.call(src, key)) obj[key] = src[key];
  return obj;
}
