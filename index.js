var swig = require("swig")
  , boostContent = require("boost").boostContent
  , path = require("path")

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

var VAR_TOKEN = 2;
var CONTROL_TOKEN = 1;
var varRegex = /^[a-zA-Z_]/;

function createDummyContext(swigTemplate) {
  var results = {};
  iterate(swigTemplate, addVar);
  return results;

  function addVar(name, value) {
    results[name] = merge(results[name], value);
  }
}

function merge(original, value) {
  if (original == null) return value;
  if (typeof original === 'string') return value;
  if (Array.isArray(original)) return original;
  if (typeof original === 'object') {
    if (typeof value === 'object') {
      for (var prop in value) {
        original[prop] = merge(original[prop], value[prop]);
      }
    }
    return original;
  }
  return value;
}

function iterate(token, addVar) {
  var tokens = token.tokens;
  if (tokens) tokens.forEach(onChild);

  var blocks = token.blocks;
  var blockName;
  if (blocks) {
    for (blockName in blocks) {
      onChild(blocks[blockName]);
    }
  }

  function onChild(child) {
    var type = child.type;
    if (type === VAR_TOKEN) {
      splitAndAddVar(child.name);
    } else if (child.name === 'for' && type === CONTROL_TOKEN) {
      addForVar();
    } else if (child.name === 'if' && type === CONTROL_TOKEN) {
      child.args.forEach(addIfVar);
      iterate(child, addVar);
    } else {
      iterate(child, addVar);
    }

    function addForVar() {
      var iteratorName = child.args[0];
      var arrayName = child.args[2];
      var array = [iteratorName];
      splitAndAddVar(arrayName, array);
      iterate(child, newAddVar);

      function newAddVar(name, value) {
        if (name === iteratorName) {
          array[0] = merge(array[0], value);
        } else {
          addVar(name, value);
        }
      }
    }

    function addIfVar(token) {
      if (varRegex.test(token)) {
        addVar(token, token);
      }
    }

    function splitAndAddVar(name, value) {
      var parts = name.split('.');
      value = value || parts[parts.length - 1];
      var root = parts.shift();
      var obj, part;
      while (part = parts.pop()) {
        obj = {};
        obj[part] = value;
        value = obj;
      }
      addVar(root, value);
    }
  }
}
