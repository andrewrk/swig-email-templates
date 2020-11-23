# swig-email-templates

**This package is unmaintained; please volunteer if you want it to not rely on outdated dependencies.**

swig-email-templates is a Node.js module for rendering emails with Swig templates and
email-friendly inline CSS using [juice](https://github.com/Automattic/juice),
inspired by [niftylettuce/node-email-templates](https://github.com/niftylettuce/node-email-templates).


## Features

 * Uses [swig], which supports
   [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance).
 * Uses [juice], which takes an HTML
   file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * URL rewrite support - you can provide a function to rewrite your links.
 * Text emails - for a template name passed into render(), if a file exists
   with the same name but a .txt extension it will be rendered separately.
   If the .txt file does not exist, [html-to-text] will auto-generate a text
   version of the html file. This can be disabled with the option `text: false`.


## Upgrading from 1.x

Check out the changelog for details of what changed since 1.x.  The upgrade
should be pretty straightforward.


## Quick start

Install:

    npm install swig-email-templates

A quick working example:

```js
var EmailTemplates = require('swig-email-templates');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();

var templates = new EmailTemplates();
var context = {
  meatballCount: 9001
};

templates.render('meatball-sandwich.html', context, function(err, html, text, subject) {

  // Send email
  transporter.sendMail({
      from: 'sender@address',
      to: 'receiver@address',
      subject: subject,
      html: html,
      text: text
  });

});
```


## EmailTemplates API

### Constructor(options)

Creates a a new EmailTemplates instance.

```js
var EmailTemplates = require('swig-email-templates');
var templates = new EmailTemplates();
```

To set options, pass an object to the constructor.  It can have the following keys:

#### root (string)

Path to template files.  Defaults to ```path.join(__dirname, 'templates')```

#### swig (object)

Swig options.  Gets passed to swig.setDefaults().  [See swig documentation for more information](https://node-swig.github.io/swig-templates/docs/api/#SwigOpts).

#### filters (object)

An object of Swig filters to set.  Format: { name1: method1, name2: method2 }.  For more information [see Swig documentation for setFilter()](https://node-swig.github.io/swig-templates/docs/api/#setFilter).

#### juice (object)

Juice options. [See juice documentation for more information](https://github.com/Automattic/juice#options).

#### rewrite (function(cheerio instance))

After rendering the template and running the rewriteUrl function (see below), but before inlining resources, this function will be called if provided.  It will be passed a [cheerio] instance and can alter its content.  Cheerio instances are modified in-place so it does not need to return a value.

#### rewriteUrl (function (string) => string)

Each ```a href``` attribute in the output HTML will have its value replaced by the result of calling this function with the original href value.

#### text (boolean)

Whether to generate text alternative to HTML.  Defaults to ```true```.

#### Example

```js
new EmailTemplates({
  root: '/var/www/test.site/templates',
  text: false,       // Disable text alternatives
  swig: {
    cache: false     // Don't cache swig templates
  },
  filters: {
    upper: function(str) {
      return str.toUpperCase();
    }
  },
  juice: {
    webResources: {
      images: 8      // Inline images under 8kB
    }
  },
  rewriteUrl: function (url) {
    return url + 'appendage';
  },
  rewrite: function($) {
    $("img").each(function(idx, anchor) {
      $(anchor).attr('src', 'no-img.png');
    });
  }
})
```

### render(templateName, context, callback)

Render a template with templateName, with the context provided.  Callback takes three parameters: (error, html, text, subject).

Example:

```js
var EmailTemplates = require('swig-email-templates');
var templates = new EmailTemplates();
templates.render('template.html', { user: 55 }, function (err, html, text, subject) {
  // html is inlined html
  // text is text equivalent
  // subject is parsed subject template or null if not found
})
```

#### Behaviour of text templates

If the 'text' option is true (see above), then swig-email-templates will attempt to create a text equivalent as well as your HTML.  By default, this will be by rendering the HTML output as text using [html-to-text].

You can provide your own text template to override this behaviour.  This should have the same basename as your HTML template but end in '.txt' instead of '.html'.  For example, if your HTML template is 'template.html' then the text version should be 'template.txt'.  This will receive the same context as the HTML template.

If the 'text' option is false, then no text alternative will be generated and the callback passed to the EmailTemplate.render() function will receive a falsy value instead of text as its third argument.

#### Behaviour of subject templates

swig-email-templates will attempt to create a text equivalent as well as your HTML. This template should have the same basename as your HTML template but end in `.subject.txt`. This will receive the same context as the HTML template.

Using subject templates, you can generate subject that contains variables.

## Command Line

Installing swig-email-templates through npm will put the `swig-email-templates` command in your system path, allowing it to be run from any directory.

### Usage

```
swig-email-templates [files] [options]
```

Where `[files]` can be any number of input files to process.

The options are:

* **-v, --version**: Display the installed version of swig-email-templates
* **-h, --help**: Show the help screen
* **-o, --output**: The directory to output your files to. Defaults to `stdout`
* **-r, --root**: The root location for the files. The default is `.`.
* **-j, --json**: The file that contains your context, stored in JSON.
* **-c, --context**: The file that contains your context, stored as a CommonJS module. Used only if `-j` is not provided.

### Example

The following example renders two files, `email1.html` and `email2.html`, which are both contained in the cwd. It uses the context stored in `context/main.json` for rendering, and places the results in the folder `output`.

```
swig-email-templates email1.html email2.html -o output/ -j context/main.json
```


## Tests

```
npm test
```


  [swig]: https://github.com/paularmstrong/swig/
  [cheerio]: https://npmjs.com/package/cheerio
  [juice]: https://github.com/Automattic/juice
  [html-to-text]: https://www.npmjs.com/package/html-to-text
