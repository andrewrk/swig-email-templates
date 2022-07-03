var EmailTemplates = require('../')
var assert = require('assert')
var cheerio = require('cheerio')

describe('EmailTemplates', function() {
    describe('if I create a new EmailTemplates instance', function() {
        it('I should get an object', function() {
            var templates = new EmailTemplates()
            assert.equal(Object.prototype.toString(templates), '[object Object]')
        })
    })

    describe('if I set options...', function() {
        it('if I provide a swig filter it should be used', async function() {
            const templates = new EmailTemplates({
                root: 'test/templates/',
                text: false,
                filters: {
                    whereproof: function() {
                        return 'the proof is in the pudding'
                    }
                }
            })

            const { html } = await templates.render('filter.html', null)
            assert.equal(html, 'the proof is in the pudding')
        })

        describe('if I provide a rewrite function', function() {
            it('it should be passed a cheerio instance', function(done) {
                var rewriteCalled = false
                var templates = new EmailTemplates({
                    root: 'test/templates/',
                    text: false,
                    rewrite: function($) {
                        var text = $('p').text()
                        assert.equal(text, 'Testing')
                        rewriteCalled = true
                    }
                })

                templates.render('inline_style_link.html', null, function() {
                    assert.equal(rewriteCalled, true)
                    done()
                })
            })
        })
    })

    describe('the render function', function() {
        it('should feed errors through callback (nonexistent templates)', function(done) {
            var templates = new EmailTemplates()
            templates.render('nonexistent', null, function(err) {
                assert.equal(err.code, 'ENOENT')
                done()
            })
        })

        it('should return convert HTML to text if no text alternative file is present', async function() {
            const templates = new EmailTemplates({
                root: 'test/templates/'
            })

            const { text } = await templates.render('no_text_file_alternative.html', {})
            assert.equal(text, 'This is a message with bold, just a tester.')
        })

        it('should respect disabling HTML-to-text', async function() {
            const templates = new EmailTemplates({
                root: 'test/templates/',
                text: false
            })

            const { text } = await templates.render('no_text_file_alternative.html', {})
            assert.equal(text, null)
        })
    })

    describe('the rewriteUrls function', function() {
        it('should always pass strings to the rewriter function', function() {
            var $ = cheerio.load('<a>testing</a> <a href="">testing-2</a>')
            var templates = new EmailTemplates()

            templates._rewriteUrls($, function(url) {
                assert.equal(typeof url, 'string')
            })
        })
    })
})
