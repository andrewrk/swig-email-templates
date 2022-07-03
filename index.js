'use strict'

const path = require('path')
const fs = require('fs')
const swig = require('swig-templates')
const juice = require('juice')
const cheerio = require('cheerio')
const htmlToText = require('html-to-text')

class EmailTemplates {
    constructor(options = {}) {
        this.options = options
        this.options.root = options.root || path.join(__dirname, 'templates')
        this.options.filters = this.options.filters || {}
        this.options.juice = options.juice || {}
        this.options.juice.webResources = options.juice.webResources || {}
        this.options.juice.webResources.relativeTo = options.juice.webResources.relativeTo || options.root

        swig.setDefaults(this.options.swig)

        for (const filter in this.options.filters) {
            swig.setFilter(filter, this.options.filters[filter])
        }
    }

    /** (Internal) Compile and render a swig template */
    renderTemplate(path, context) {
        return swig.compileFile(path)(context)
    }

    /** (Internal) Generate text counterpart to HTML template */
    generateText(templatePath, context, html, cb) {
        if ('text' in this.options && !this.options.text) {
            return cb(null, null)
        }

        const textFilename = path.basename(templatePath, path.extname(templatePath)) + '.txt'
        const textPath = path.resolve(path.dirname(templatePath), textFilename)

        fs.exists(textPath, (exists) => {
            if (exists) {
                cb(null, this.renderTemplate(textPath, context))
            } else {
                cb(null, htmlToText.fromString(html))
            }
        })
    }

    /** (Internal) Generate text counterpart to HTML template */
    generateSubject(templatePath, context, cb) {
        const textFilename = path.basename(templatePath, path.extname(templatePath)) + '.subject.txt'
        const textPath = path.resolve(path.dirname(templatePath), textFilename)

        fs.exists(textPath, (exists) => {
            if (exists) {
                cb(null, this.renderTemplate(textPath, context))
            } else {
                cb(null, null)
            }
        })
    }

    /** (Internal) Rewrite URLs in a Cheerio doc using a given function */
    rewriteUrls($, rewrite) {
        $('a').each(function(idx, anchor) {
            const href = $(anchor).attr('href')
            if (href !== undefined) {
                $(anchor).attr('href', rewrite(href))
            }
        })
    }

    /** Render a template given 'templateName' and context 'context' */
    render(templateName, context = {}, cb) {
        const templatePath = path.resolve(this.options.root, templateName)

        let html, $
        try {
            html = this.renderTemplate(templatePath, context)
            $ = cheerio.load(html, { decodeEntities: false })
            if (this.options.rewriteUrl) {
                this.rewriteUrls($, this.options.rewriteUrl)
            }
            if (this.options.rewrite) {
                this.options.rewrite($)
            }
        } catch (err) {
            return cb(err)
        }

        // Inline resources
        juice.juiceResources($.html(), this.options.juice, (err, inlinedHTML) => {
            if (err) return cb(err)

            this.generateText(templatePath, context, html, (err, text) => {
                if (err) return cb(err)

                this.generateSubject(templatePath, context, (err, subject) => {
                    if (err) return cb(err)

                    cb(null, inlinedHTML, text, subject)
                })
            })
        })
    }
}

module.exports = EmailTemplates
