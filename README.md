gulp-dss-extra  [![NPM version][npm-image]][npm-url] [![Dependency Status][depstat-image]][depstat-url] [![Build Status][travis-image]][travis-url]
===

A gulp plug-in for parsing [Documented Style Sheets][] (DSS) comments in your CSS/SCSS/LESS, with a couple of extra features.

## Usage

This will add `dss` and `meta` properties to your files.

    var gulp = require('gulp');
    var dss = require('gulp-dss-extra');

    gulp.task('dss', function() {
        return gulp.src('src/**/*.scss')
            .pipe(dss());
    });

It doesn't output any files, so should be used with another pipe that merges with templates.

## Extra

### DSS Parsers

These parsers are in addition to default `@name`, `@description`, `@state` and `@markup`:

* `@variable {name} - {description}` - Document a variable. The `name` must match the name in the file without a `$` prefix. The value will be extracted from the file and assigned to `value`. It won't be computed so things like `$height: 5px*10` will have a literal value `5px*10`.

### `@state` Markup Examples

The `@state` is post-parsed to add HTML examples for each state. This is rendered with the `state` (using hogan) so you can add class names etc. For example:

    /**
     * @name Button
     * @state .primary - Primary button
     * @state .danger - Dangerous button
     * @markup
     * <button class="{{{escaped}}}">{{description}}</button>
     */

As well as `block.markup` each state will now have `markup.example` and `markup.escaped` added. Empty attributes will be stripped from the stateless example to avoid clutter.

## Options

### extra `object`

An key/value hash of additional properties to extract. The value should be a function to parse the DSS (see the [DSS][] docs), or `true` if you just want the value as is.

### copyFirst `object`

A key/value hash of properties to copy from the first block to `file.meta`. The value can be a function which will be passed the `file` and the `firstBlock` and should assign, or `true` just to copy the property.

[Documented Style Sheets]:https://github.com/darcyclarke/DSS
[DSS]:https://github.com/darcyclarke/DSS

[npm-url]: https://npmjs.org/package/gulp-dss-extra
[npm-image]: http://img.shields.io/npm/v/gulp-dss-extra.svg?style=flat

[depstat-url]: https://david-dm.org/paulwib/gulp-dss-extra
[depstat-image]: https://david-dm.org/paulwib/gulp-dss-extra.svg?style=flat

[travis-image]: http://img.shields.io/travis/paulwib/gulp-dss-extra/master.svg?style=flat
[travis-url]: https://travis-ci.org/paulwib/gulp-dss-extra
