var swig = require("swig")
  , boostContent = require("boost").boostContent
  , path = require("path")
  , createDummyContext = require('swig-dummy-context')

module.exports = init;
init.createDummyContext = createDummyContext;

function init(options, cb) {
  options = extend({
    root: path.join(__dirname, "templates"),
    allowErrors: true,
  }, options || {});
  swig.init(options);

  cb(null, render, dummyContext);

  function dummyContext(templateName, cb) {
    // compile file into swig template
    compileTemplate(templateName, function(err, template) {
      if (err) return cb(err);
      // return the tokens
      cb(null, createDummyContext(template));
    });
  }
    
  function render(templateName, context, cb) {
    // compile file into swig template
    compileTemplate(templateName, function(err, template) {
      if (err) return cb(err);
      // render template with context
      renderTemplate(template, context, function(err, html) {
        if (err) return cb(err);
        // validate html and inline all css
        boostContent(html, path.join(options.root, templateName), function(err, html) {
          if (err) return cb(err);
          cb(null, html);
        });
      });
    });
  }
}

function compileTemplate(name, cb) {
  try {
    cb(null, swig.compileFile(name + ".html"));
  } catch (err) {
    cb(err);
  }
}

function renderTemplate(template, context, cb) {
  try {
    cb(null, template.render(context));
  } catch (err) {
    cb(err);
  }
}

var owns = {}.hasOwnProperty;
function extend(obj, src) {
  for (var key in src) if (owns.call(src, key)) obj[key] = src[key];
  return obj;
}
