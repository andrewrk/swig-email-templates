### 6.0.0

 * Upgrade dependencies: juice 4.1.0 -> 7.0.0, swig-templates 2.0.2 -> 2.0.3,
   html-to-text 3.3.0 -> 6.0.0
 * Check in package lockfile


### 4.0.0

 * **Warning:** swig is no longer maintained.  Use this package at your
   own risk.  You may wish to switch to [nunjucks] and for emails, use
   [email-templates].
 * Upgrade to Juice 3.  This brings changes from its dependency
   [web-resource-inliner].
 * Add support for email subject.

[nunjucks]: https://mozilla.github.io/nunjucks/
[email-templates]: https://www.npmjs.com/package/email-templates
[web-resource-inliner]: https://www.npmjs.com/package/web-resource-inliner

### 3.0.0

 * Upgrade to Juice 2.  This changes various defaults for inlining styles.
   See the [list of changes in Juice](j2changes) for more information.  These
   are mostly changes around preserving `@font-face` and `@media`, and
   applying widths/heights to tables.
 * Fix Outlook-breaking cheerio config (issue #34)
 * Update README for command-line utility

[j2changes]: https://github.com/Automattic/juice/commit/a4cf6fdb671be56e6a01fd740f6460849b8813df

### 2.1.0

 * Add new option: 'rewrite'
   - This allows you to read and alter the rendered HTML in whatever way
     wish before inling resources or generating text alternatives
 * Update dependencies

### 2.0.0

 * **Support for Node 4+ as well as 0.10 & 0.12**
 * Switch to Cheerio instead of JSDom for compatibility with a wider range of
   Node versions
   - this means that the HTML you provide in your template will be closer to
     the output of swig-email-templates.  JSDom added in html, body, tbody tags
     where Cheerio doesn't
 * Switch back to the the original 'juice' which is now more actively maintained
   - this version of juice also inlines images using data: URLs
   - be mindful that juice will fetch external resources for inlining, which can
     take some time
 * At the same time it made sense to refactor the API a bit:
   - the library presents itself as a class with a constructor method
   - rewriteUrl is now an option on EmailTemplates instead of an extra argument
     to render()
   - commandline tool no longer takes 'render' as a parameter
 * Add support for setting filters on the swig instance
 * Much more comprehensive documentation

### 1.4.0

 * Marcin Jekot and domasx2
   - update to work on node v0.12 and fix test failures.

### 1.3.0

 * Connor Keenan
   - support text templates as well as html, and automatically render
     text emails based on the html when none is provided.

### 1.2.0

 * Andrew Kelley
   - pend instead of batch dev dependency
   - update dependencies
   - extract CHANGELOG from README
   - add Expat license

### 1.1.0

 * Dennis
   - Allow options to be passed to juice

### 1.0.1

 * Joshua Halickman
   - Pass options to swig if we want to set any outside of the swig-email-templates
   - Update package.json

### 1.0.0

 * **BREAKING CHANGE** - the ability to generate a dummy context was removed
   because swig [dropped support](https://github.com/paularmstrong/swig/issues/176)
   for ability to access the parse tree when it went to 1.x.
 * Update swig dependency to 1.3.0
 * Update jsdom dependency to 0.8.11
 * Switch to [juice2 fork](https://github.com/andrewrk/juice)

### 0.7.0

 * added command line program (thanks [jmeas](https://github.com/jmeas))

### 0.6.0

 * updated swig to 0.14.0

### 0.5.1

 * updated juice to 0.4.0

### 0.5.0

 * **BREAKING CHANGE** - `render` and `generateDummy` no longer automatically append
   `.html` to your template name to look it up. This means that if you before had
   `render('meatball-sandwich')` you must change it to
   `render('meatball-sandwich.html')` to work with 0.5.0.
 * fixed crash during cleanup
 * updated juice to 0.3.2
 * updated jsdom to 0.5.4
