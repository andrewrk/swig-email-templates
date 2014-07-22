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
