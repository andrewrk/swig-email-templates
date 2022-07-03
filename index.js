'use strict'

const path = require('node:path')
const { access } = require('node:fs/promises')
const { constants } = require('node:fs')
const swig = require('swig-templates')
const juice = require('juice')
const cheerio = require('cheerio')
const htmlToText = require('html-to-text')
const util = require('util')

class EmailTemplates {
    constructor(options = {}) {
        this.options = options
        this.options.root = options.root || path.join(__dirname, 'templates')
        this.options.filters = this.options.filters || {}
        this.options.juice = options.juice || {}
        this.options.juice.webResources = options.juice.webResources || {}
        this.options.juice.webResources.relativeTo =
            options.juice.webResources.relativeTo || options.root

        swig.setDefaults(this.options.swig)

        for (const filter in this.options.filters) {
            swig.setFilter(filter, this.options.filters[filter])
        }
    }

    /** Compile and render a swig template */
    _renderTemplate(path, context) {
        return swig.compileFile(path)(context)
    }

    /** Generate text counterpart to HTML template */
    async _generateText(templatePath, context, html) {
        if ('text' in this.options && !this.options.text) {
            return null
        }

        const textFilename =
            path.basename(templatePath, path.extname(templatePath)) + '.txt'
        const textPath = path.resolve(path.dirname(templatePath), textFilename)

        try {
            await access(textPath, constants.R_OK)
            return this._renderTemplate(textPath, context)
        } catch (err) {
            return htmlToText.fromString(html)
        }
    }

    /** Generate text counterpart to HTML template */
    async _generateSubject(templatePath, context) {
        const subjectFilename =
            path.basename(templatePath, path.extname(templatePath)) +
            '.subject.txt'
        const subjectPath = path.resolve(
            path.dirname(templatePath),
            subjectFilename
        )

        try {
            await access(subjectPath, constants.R_OK)
            return this._renderTemplate(subjectPath, context)
        } catch (err) {
            return null
        }
    }

    /** Rewrite URLs in a Cheerio doc using a given function */
    _rewriteUrls($, rewrite) {
        $('a').each(function (idx, anchor) {
            const href = $(anchor).attr('href')
            if (href !== undefined) {
                $(anchor).attr('href', rewrite(href))
            }
        })
    }

    async _renderPromise(templateName, context) {
        const templatePath = path.resolve(this.options.root, templateName)
        const html = this._renderTemplate(templatePath, context)
        const $ = cheerio.load(html, { decodeEntities: false })

        if (this.options.rewriteUrl) {
            this._rewriteUrls($, this.options.rewriteUrl)
        }
        if (this.options.rewrite) {
            this.options.rewrite($)
        }

        const juiceResources = util.promisify(juice.juiceResources)
        const [inlinedHTML, text, subject] = await Promise.all([
            juiceResources($.html(), this.options.juice),
            this._generateText(templatePath, context, html),
            this._generateSubject(templatePath, context),
        ])
        return { html: inlinedHTML, text, subject }
    }

    /** Render a template given 'templateName' and context 'context' */
    render(templateName, context = {}, cb) {
        if (!cb) {
            this._renderPromise(templateName, context)
        } else {
            this._renderPromise(templateName, context)
                .then(({ html, text, subject }) => cb(null, html, text, subject))
                .catch((err) => {
                    cb(err)
                })
        }
    }
}

module.exports = EmailTemplates
