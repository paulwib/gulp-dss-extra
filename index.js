'use strict';

var dss = require('dss');
var es = require('event-stream');
var gutil = require('gulp-util');
var path = require('path');
var hogan = require('hogan.js');
var markdown = require('marked');
var crypto = require('crypto');
var extend = require('extend');

module.exports = dssextra;

var defaultOptions = {
    extra: {},
    copyFirst: {
        sectionName: sectionName,
        subsectionName: subsectionName
    },
    normalizeArray: ['state', 'variable']
};

/**
 * Pipe for extracting DSS and adding to the file's properties
 *
 * @return {stream}
 */
function dssextra(options) {

    var template, firstBlock;

    // Add variable parser on the fly as requires a closure
    defaultOptions.extra.variable = variableDssParser();
    options = extend(true, defaultOptions, options);

    // Add parsers
    Object.keys(options.extra).forEach(function(prop) {
        if (typeof options.extra[prop] !== 'function') {
            options.extra[prop] = parseLine;
        }
        dss.parser(prop, options.extra[prop]);
    });

    return es.map(function(file, cb) {

        if (file.isNull()) {
            return;
        }
        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-styleguide',  'Streaming not supported'));
            return;
        }
        file.meta = {};

        dss.parse(file.contents.toString('utf8'), {}, function(dss) {

            // Extract file level properties
            if (dss.blocks.length) {
                firstBlock = dss.blocks[0];
                Object.keys(options.copyFirst).forEach(function(prop) {
                    if (typeof options.copyFirst[prop] === 'function') {
                        file.meta[prop] = options.copyFirst[prop](file, firstBlock);
                    }
                    else if (firstBlock[prop] && options.copyFirst[prop]) {
                        file.meta[prop] = firstBlock[prop];
                    }
                });
            }

            dss.blocks.forEach(function(block) {
                // Convert description from markdown to HTML
                if (block.hasOwnProperty('description')) {
                    block.description = markdown(String(block.description));
                }
                // Properties to normalize to arrays
                options.normalizeArray.forEach(function(prop) {
                    if (block.hasOwnProperty(prop) && typeof block[prop].slice !== 'function') {
                        block[prop] = [block[prop]];
                    }
                });
                // Add state examples
                if (block.hasOwnProperty('state') && block.hasOwnProperty('markup')) {
                    template = hogan.compile(block.markup.example);
                    block.markup.example = template.render({}).replace(/\s?[a-z]+="\s*"/gi, '');
                    block.markup.escaped = block.markup.example.replace(/</g, '&lt;').replace(/>/g, '&gt;');

                    block.state.forEach(function(state) {
                        state.markup = {
                            example: template.render(state),
                            escaped: template.render(state).replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        };
                    });
                }
            });
            file.dss = dss;
            cb(null, file);
        });
    });
}

function parseLine(i, line) {
    return line;
}

function sectionName(file, firstBlock) {

    if (!firstBlock.name) {
        return false;
    }
    var basename = path.basename(file.relative, path.extname(file.path));

    // Get section name from index file
    if (basename === 'index') {
        return firstBlock.name;
    }

    return false;
}
function subsectionName(file, firstBlock) {

    if (!firstBlock.name) {
        return false;
    }
    var basename = path.basename(file.relative, path.extname(file.path)),
        returnValue = false;

    // Get section name from index file
    if (basename !== 'index') {
        returnValue = firstBlock.name;
        delete firstBlock.name;
    }

    return returnValue;
}
/**
 * Get parser for a file which will extract "@variable {name} - {description}"
 *
 * @param {object} file - The file to extract the variable values from
 * @return {function} A DSS parser
 */
function variableDssParser() {

    var fileVariables = {},
        fileVariablesRx = /^[\$|@]([a-zA-Z0-9_]+):([^\;]+)\;/gim,
        lineSplitRx = /((\s|-)+)/,
        variables = {},
        match, hash, tokens, name;

    return function(i, line, block, css) {
        hash = crypto.createHash('md5').update(css).digest('hex');
        if (!fileVariables[hash]) {
            while ((match = fileVariablesRx.exec(css)) !== null) {
                variables[match[1].trim()] = match[2].trim();
            }
            fileVariables[hash] = variables;
        }

        // Extract name and any delimiter with description
        tokens = line.split(lineSplitRx, 2);
        name = tokens[0].trim();
        if (variables.hasOwnProperty(name)) {
            return {
                name: name,
                // Description is line with name and any delimiter replaced
                description: line.replace(tokens.join(''), ''),
                value: variables[name]
            };
        }
    };
}
