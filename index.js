var path = require('path')
var loaderUtils = require('loader-utils')
var cache = require('./lib/cache')
var genId = require('./lib/gen-id')

var TAG_MAP = {
  template: 'template',
  t: 'template',
  script: 'script',
  s: 'script',
  style: 'style',
  c: 'style'
}

var LANG_MAP = {
  template: 'lang="pug"',
  script: 'lang="coffee"',
  style: 'lang="stylus"'
}

module.exports = function (source) {
  this.cacheable()

  var filePath = this.resourcePath
  var lines = source.split('\n')
  var result = []
  var lastSegment = null

  lines.forEach(function (line) {
    if (/^\S/g.test(line)) {
      if (lastSegment) {
        result.push('</' + lastSegment + '>')
        lastSegment = null
      }

      const m = line.match(/(\w+)(\(([\S\s]+)\))?/)
      const attrs = m[3] ? m[3].replace(/,/g, ' ') : ''

      line = m[1]
      lastSegment = TAG_MAP[line]

      if (!lastSegment) {
        result.push('<' + line + ' ' + attrs + '>')
        lastSegment = line
      } else {
        result.push('<' + lastSegment + ' ' + LANG_MAP[lastSegment] + ' ' + attrs + '>')
      }
    } else {
      result.push(line)
    }
  })
  result.push('</' + lastSegment + '>')
  result = result.join('\n')

  var extname = path.extname(filePath)
  var fileName = path.basename(filePath, extname)

  filePath = cache.save(fileName + '-' + genId(filePath), result)

  return 'module.exports = require(' +
    loaderUtils.stringifyRequest(this, '!!vue-loader!' + filePath) +
    ');'
}
