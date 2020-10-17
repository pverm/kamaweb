(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var ircf = require('irc-formatting');

function textToColor(text) {
  return ircf.renderHtml(text);
}

global.textToColor = textToColor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"irc-formatting":2}],2:[function(require,module,exports){
var Block = require('./lib/block');

var ircf = {};

ircf.Block = Block;

ircf.parse = function(text) {
  var result = [];
  var current = new Block(null);
  var colorMatches = [];
  var colorRegex = new RegExp(ircf.C_REGEX);
  var colorMatch;
  var startIndex = 0;

  // Find all color matches.
  while(colorMatch = colorRegex.exec(text)) {
    colorMatches.push(colorMatch);
  }

  // Append a resetter to simplify code a bit
  text += ircf.R;

  for(var i = 0; i < text.length; ++i) {
    var ch = text.charAt(i);
    var prev = null;
    var skip = 0;
    var nextStart = -1;

    switch(ch) {
      // bold, italic, underline
      case "\x02": case "\x1d": case "\x1f": {
        prev = current;
        current = new Block(prev);

        // Toggle style
        current[ircf.KEYS[ch]] = !prev[ircf.KEYS[ch]];

        break;
      }

      // color
      case "\x03": {
        prev = current;
        current = new Block(prev);

        var color = _getMatch(colorMatches, i);

        if(color !== null) {
          current.color = parseInt(color[1]);
          current.highlight = parseInt(color[3]) || prev.highlight;

          nextStart = color.index + color[0].length;
        } else {
          current.color = -1;
          current.highlight = -1;
        }

        break;
      }

      // reverse
      case "\x16": {
        prev = current;
        current = new Block(prev);

        if(prev.color !== -1) {
          current.color = prev.highlight;
          current.highlight = prev.color;

          if(current.color === -1) {
            current.color = 0;
          }
        }

        current.reverse = !prev.reverse;

        break;
      }

      // reset
      case "\x0f": {
        prev = current;
        current = new Block(null);

        break;
      }
    }

    if(prev !== null) {
      prev.text = text.substring(startIndex, i);

      if(nextStart !== -1) {
        startIndex = nextStart;
      } else {
        startIndex = i + 1;
      }

      if(prev.text.length > 0) {
        result.push(prev);
      }
    }

    i += skip;
  }

  return result;
}

ircf.renderIrc = function(blocks) {
  var prev = Block.EMPTY;
  var result = '';

  blocks = blocks.concat(Block.EMPTY);

  for(var i = 0; i < blocks.length; ++i) {
    var block = blocks[i];
    var carets = '';

    if(block.bold !== prev.bold) {
      carets += ircf.B;
    }

    if(block.italic !== prev.italic) {
      carets += ircf.I;
    }

    if(block.underline !== prev.underline) {
      carets += ircf.U;
    }

    if(block.reverse !== prev.reverse) {
      carets += ircf.R;
    }

    if(!block.hasSameColor(prev, true)) {
      if(block.color !== -1) {
        carets += ircf.C + block.getColorString();
      } else {
        carets += ircf.C;
      }
    }

    // Reset if it serves the same purpose, but saves space.
    if(carets.length > 1 && block.isPlain()) {
      carets = ircf.O;
    }

    result += carets + block.text;

    prev = block;
  }

  return result;
}

ircf.renderHtml = function(blocks) {
  if(typeof(blocks) === 'string') {
    blocks = ircf.parse(blocks);
  }

  var prev = Block.EMPTY;
  var result = '';

  for(var i = 0; i < blocks.length; ++i) {
    var block = blocks[i];
    var classes = [];
    var tags = [];
    var body = block.text;

    if(block.underline) {
      tags.push(ircf.TAG_UNDERLINE);
    }

    if(block.italic) {
      tags.push(ircf.TAG_ITALIC);
    }

    if(block.bold) {
      tags.push(ircf.TAG_BOLD);
    }

    if(block.reverse) {
      classes.push(ircf.CLASS_REVERSE);

      if(block.color === -1) {
        classes.push(ircf.CLASS_NOCOLOR);
      }
    }

    if(block.color !== -1) {
      classes.push(ircf.CLASS_COLOR_PREF + block.color);

      if(block.highlight !== -1) {
        classes.push(ircf.CLASS_HIGHLIGHT_PREF + block.highlight);
      }
    }

    for(var j = 0; j < tags.length; ++j) {
      body = _wrapTag(tags[j], null, body);
    }

    if(classes.length > 0) {
      result += _wrapTag(ircf.TAG_BLOCK, classes, body);
    } else {
      result += body;
    }

    prev = block;
  }

  return result;
}

ircf.strip = function(blocks) {
  if(typeof(blocks) === 'string') {
    blocks = ircf.parse(blocks);
  }

  return blocks.map(function(block) {return block.text;}).join('');
}

ircf.removeStyle = function(blocks) {
  for(var i = 0; i < blocks.length; ++i) {
    var block = blocks[i];

    block.bold = block.italic = block.underline = false;
  }

  return blocks;
}

ircf.removeColor = function(blocks) {
  for(var i = 0; i < blocks.length; ++i) {
    var block = blocks[i];

    block.color = block.highlight = -1;
  }

  return blocks;
}

ircf.compress = function(blocks) {
  if(blocks.length <= 1) {
    return blocks;
  }

  var last = blocks[0];

  for(var i = 1; i < blocks.length; ++i) {
    var block = blocks[i];

    if(last.equals(block)) {
      last.text += block.text;
      blocks.splice(i--, 1);
    } else {
      last = block;
    }
  }

  return blocks;
}

ircf.swigFilter = function(input, inline) {
  var lines = input.split('\n');
  var result = '';

  for(var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    var blocks = ircf.parse(line);
    var html = ircf.renderHtml(line);

    if(inline) {
      result += html;
    } else {
      result += _wrapTag(ircf.TAG_LINE, [ircf.CLASS_LINE], html);
    }
  }

  return result;
}

ircf.swigInline = function(input) {
  return ircf.swigFilter(input, true);
}

ircf.B = '\x02';
ircf.I = '\x1d';
ircf.U = '\x1f';
ircf.C = '\x03';
ircf.R = '\x16';
ircf.O = '\x0f';
ircf.C_REGEX = /\x03(\d\d?)(,(\d\d?))?/g;
ircf.KEYS = {
  "\x02": 'bold',
  "\x1d": 'italic',
  "\x1f": 'underline'
}
ircf.TAG_BOLD = 'b';
ircf.TAG_ITALIC = 'i';
ircf.TAG_UNDERLINE = 'u';
ircf.TAG_BLOCK = 'span';
ircf.TAG_LINE = 'p';
ircf.CLASS_REVERSE = 'ircf-reverse';
ircf.CLASS_COLOR_PREF = 'ircf-fg-';
ircf.CLASS_HIGHLIGHT_PREF = 'ircf-bg-';
ircf.CLASS_NOCOLOR = 'ircf-no-color';
ircf.CLASS_LINE = 'ircf-line';

function _getMatch(matches, index) {
  for(var i = 0; i < matches.length; ++i) {
    var match = matches[i];

    if(index === match.index) {
      return match;
    } else if(match.index > index) {
      return null;
    }
  }

  return null;
}

function _wrapTag(tag, classes, text) {
  var open = '<' + tag;
  var close = '</' + tag + '>';

  if(classes !== null && classes.length > 0) {
    open += ' class="' + classes.join(' ') + '">'
  } else {
    open += '>';
  }

  return open + text + close;
}

module.exports = ircf;

},{"./lib/block":3}],3:[function(require,module,exports){
var zeropad = require('zeropad');

function Block(prev, text) {
  this.text = (typeof(text) !== 'undefined') ? text : null;

  if(prev != null) {
    this.bold = prev.bold;
    this.italic = prev.italic;
    this.underline = prev.underline;
    this.reverse = prev.reverse;
    this.color = prev.color;
    this.highlight = prev.highlight;
  } else {
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.reverse = false;
    this.color = -1;
    this.highlight = -1;
  }

  if(this.color > 99) {
    this.color = 99;
  }

  if(this.highlight > 99) {
    this.highlight = 99;
  }
}

Block.prototype.equals = function(other) {
  return (this.bold === other.bold
       && this.italic == other.italic
       && this.underline === other.underline
       && this.reverse === other.reverse
       && this.color === other.color
       && this.highlight === other.highlight)
}

Block.prototype.isPlain = function() {
  return (!this.bold && !this.italic && !this.underline && !this.reverse
          && this.color === -1 && this.highlight === -1);
}

Block.prototype.hasSameColor = function(other, reversed) {
  if(this.reverse && reversed) {
    return ((this.color === other.highlight || other.highlight === -1) && this.highlight === other.color);
  } else {
    return (this.color === other.color && this.highlight == other.highlight);
  }
}

Block.prototype.getColorString = function() {
  var str = '';

  if(this.color !== -1) {
    str = zeropad(this.color, 2);
  }

  if(this.highlight !== -1) {
    str += ',' + zeropad(this.highlight, 2);
  }

  return str;
}

Block.EMPTY = new Block(null, '');

module.exports = Block;

},{"zeropad":5}],4:[function(require,module,exports){
'use strict';
module.exports = function (x) {
	return x === 0 && 1 / x === -Infinity;
};

},{}],5:[function(require,module,exports){
'use strict';
var isNegativeZero = require('negative-zero');

module.exports = function(number, length) {
    if (isNaN(number)) {
        throw new SyntaxError('zeropad requires a number or string');
    }

    if (typeof length !== 'undefined' && (isNaN(length) || length < 0)) {
        throw new SyntaxError('zeropad requires a positive integer for length');
    }

    var prefix = isNegativeZero(number) || number < 0 ? '-' : '';

    length = length || 2;
    number = Math.abs(parseFloat(number));
    var padLength = (length - String(number).length) + 1;

    var pads = new Array(padLength).join('0');
    return prefix + pads + number;
};

},{"negative-zero":4}]},{},[1]);
