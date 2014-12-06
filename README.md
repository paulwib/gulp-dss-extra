gulp-dss-extra
===


**DEPRECATED!**

The variable parser has been moved to [dss-variable-parser](https://github.com/paulwib/dss-parser-variable) as useful in various contexts, not just gulp.

The markup examples for state can be made with some post-processing of your DSS like:

```javascript
dss.blocks.forEach(function(block) {
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
```
Because this relies on 2 DSS variables being present (`markup` and `state`) it's not possible to build this into a DSS parser AFAICT.

The other bits and pieces are easy to replicate if you need then :)

---

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

### Markup Examples for `@state`

The `@state` is post-parsed to add HTML examples for each state. This is rendered with the `state` (using hogan) so you can add class names etc. For example:

    /**
     * @name Button
     * @state .primary - Primary button
     * @state .danger - Dangerous button
     * @markup
     * <button class="{{{escaped}}}">{{description}}</button>
     */

As well as `block.markup` each state will now have `markup.example` and `markup.escaped` added. Empty attributes will be stripped from the stateless example to avoid clutter.

### Properties Added to `file.meta`

* `sectionName` - The `@name` from the first block in files with basename `index` is copied to `file.meta.sectionName`
* `subsectionName` - The `@name` from the first block in files *without* basename `index` is copied to `file.meta.subsectionName`

## Options

### extra `object`

An key/value hash of additional properties to extract. The value should be a function to parse the DSS (see the [DSS][] docs), or `true` if you just want the value as is.

### copyFirst `object`

A key/value hash of properties to copy from the first block to `file.meta`. The value can be a function with signature `function (file, firstBlock)` and should return the value, or `true` just to copy the property.

Note when using the function the property doesn't have to already exist, it can be grabbed from another property. For example in the default options the value `sectionName` is assigned from the first block's `@name` in files with the basename `index`.

### normalizeArray `array`

In DSS if properties are only put into arrays if there is more than one. Properties listed in `normalizeArray` will be forced into an array. Defaults to `['variable', 'state']`.

[Documented Style Sheets]:https://github.com/darcyclarke/DSS
[DSS]:https://github.com/darcyclarke/DSS

[npm-url]: https://npmjs.org/package/gulp-dss-extra
[npm-image]: http://img.shields.io/npm/v/gulp-dss-extra.svg?style=flat

[depstat-url]: https://david-dm.org/paulwib/gulp-dss-extra
[depstat-image]: https://david-dm.org/paulwib/gulp-dss-extra.svg?style=flat

[travis-image]: http://img.shields.io/travis/paulwib/gulp-dss-extra/master.svg?style=flat
[travis-url]: https://travis-ci.org/paulwib/gulp-dss-extra
