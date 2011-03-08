/*  Prototype JavaScript framework, version 1.6.0.3
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.0.3',

  Browser: {
    IE:     !!(window.attachEvent &&
      navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
      navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div')['__proto__'] &&
      document.createElement('div')['__proto__'] !==
        document.createElement('form')['__proto__']
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return !!(object && object.nodeType == 1);
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  defer: function() {
    var args = [0.01].concat($A(arguments));
    return this.delay.apply(this, args);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.stripTags().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];
    // In Safari, only use the `toArray` method if it's not a NodeList.
    // A NodeList is a function, has an function `item` property, and a numeric
    // `length` property. Adapted from Google Doctype.
    if (!(typeof iterable === 'function' && typeof iterable.length ===
        'number' && typeof iterable.item === 'function') && iterable.toArray)
      return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});

// use native browser JS 1.6 implementation if available
if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {
      // simulating poorly supported hasOwnProperty
      if (this._object[key] !== Object.prototype[key])
        return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.inject([], function(results, pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return results.concat(values.map(toQueryPair.curry(key)));
        } else results.push(toQueryPair(key, values));
        return results;
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  // DOM level 2 ECMAScript Language Binding
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
  if (element) this.Element.prototype = element.prototype;
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },

  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return element;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return element;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    // find page position of source
    source = $(source);
    var p = source.viewportOffset();

    // find coordinate system to use
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    // set position
    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          // returns '0px' for hidden elements; we want it to return null
          if (!Element.visible(element)) return null;

          // returns the border-box dimensions rather than the content-box
          // dimensions, so we subtract padding and borders from the value
          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  // IE doesn't report offsets correctly for static elements, so we change them
  // to "relative" to get the values, then change them back.
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      // IE throws an error if element is not in document
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        // Trigger hasLayout on the offset parent so that IE6 reports
        // accurate offsetTop and offsetLeft values for position: fixed.
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  // Safari returns margins on body which is incorrect if the child is absolutely
  // positioned.  For performance reasons, redefine Element#cumulativeOffset for
  // KHTML/WebKit only.
  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  // IE and Opera are missing .innerHTML support for TABLE-related and SELECT elements
  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div')['__proto__']) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div')['__proto__'];
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName.toUpperCase(), property, value;

    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      // extend methods for all tags (Safari doesn't need this)
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName)['__proto__'];
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { }, B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      if (B.WebKit && !document.evaluate) {
        // Safari <3.0 needs self.innerWidth/Height
        dimensions[d] = self['inner' + D];
      } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {
        // Opera <9.5 needs document.body.clientWidth/Height
        dimensions[d] = document.body['client' + D]
      } else {
        dimensions[d] = document.documentElement['client' + D];
      }
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;

    // Safari 3 chokes on :*-of-type and :empty
    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;

    // XPath can't do namespaced attributes, nor can it read
    // the "checked" property from DOM nodes
    if ((/(\[[\w-]*?:|:checked)/).test(e))
      return false;

    return true;
  },

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (!Selector._div) Selector._div = new Element('div');

    // Make sure the browser treats the selector as valid. Test on an
    // isolated element to minimize cost of this check.
    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
            new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        // querySelectorAll queries document-wide, then filters to descendants
        // of the context element. That's not what we want.
        // Add an explicit context to the selector if necessary.
        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          // use the Selector.assertions methods unless the selector
          // is too complex.
          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            // reluctantly do a document-wide search
            // and look for a match in the array
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {
    // combinators must be listed first
    // (and descendant needs to be last combinator)
    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,

    // selectors follow
    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },

  // for Selector.match and Element#match
  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    // UTILITY FUNCTIONS
    // joins two collections
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    // marks an array of nodes for counting
    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },

    // mark each child node with its position (for nth calls)
    // "ofType" flag indicates whether we're indexing for nth-of-type
    // rather than nth-child
    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    // filters out duplicates and extends all nodes
    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    // COMBINATOR FUNCTIONS
    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    // TOKEN FUNCTIONS
    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          // fastlane for ordinary descendant combinators
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    // handles the an+b logic
    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    // handles nth(-last)-child, nth(-last)-of-type, and (first|last)-of-type
    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        // IE treats comments as element nodes
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    // IE returns comment nodes on getElementsByTagName("*").
    // Filter them out.
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },

    // IE improperly serializes _countedByPrototype in (inner|outer)HTML.
    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            // a key is already present; construct an array of values
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    // extend element because hasAttribute may not be native
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      event = Event.extend(event);

      var node          = event.target,
          type          = event.type,
          currentTarget = event.currentTarget;

      if (currentTarget && currentTarget.tagName) {
        // Firefox screws up the "click" event when moving between radio buttons
        // via arrow keys. It also screws up the "load" and "error" events on images,
        // reporting the document as the target instead of the original image.
        if (type === 'load' || type === 'error' ||
          (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
            && currentTarget.type === 'radio'))
              node = currentTarget;
      }
      if (node.nodeType == Node.TEXT_NODE) node = node.parentNode;
      return Element.extend(node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      var docElement = document.documentElement,
      body = document.body || { scrollLeft: 0, scrollTop: 0 };
      return {
        x: event.pageX || (event.clientX +
          (docElement.scrollLeft || body.scrollLeft) -
          (docElement.clientLeft || 0)),
        y: event.pageY || (event.clientY +
          (docElement.scrollTop || body.scrollTop) -
          (docElement.clientTop || 0))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }


  // Internet Explorer needs to remove event handlers on page unload
  // in order to avoid memory leaks.
  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }

  // Safari has a dummy event handler on page unload so that it won't
  // use its bfcache. Safari <= 3.1 has an issue with restoring the "document"
  // object when page is returned to via the back button using its bfcache.
  if (Prototype.Browser.WebKit) {
    window.addEventListener('unload', Prototype.emptyFunction, false);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

// This should be moved to script.aculo.us; notice the deprecated methods
// further below, that map to the newer Element methods.
var Position = {
  // set to true if needed, warning: firefox performance problems
  // NOT neeeded for page scrolling, only if draggable contained in
  // scrollable elements
  includeScrollOffsets: false,

  // must be called before calling withinIncludingScrolloffset, every time the
  // page is scrolled
  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  // caches x/y coordinate pair to use with overlap
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  // within must be called directly before
  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },

  // Deprecation layer -- use newer Element methods now (1.5.2).

  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();

// Copyright (c) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable
String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect) {
    element = $(element);
    effect = (effect || 'appear').toLowerCase();
    var options = Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, arguments[2] || { });
    Effect[element.visible() ?
      Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    function codeForEvent(options,eventName){
      return (
        (options[eventName+'Internal'] ? 'this.options.'+eventName+'Internal(this);' : '') +
        (options[eventName] ? 'this.options.'+eventName+'(this);' : '')
      );
    }
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);

// Copyright (c) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2008 Sammi Williams (http://www.oriontransfer.co.nz, sammi@oriontransfer.co.nz)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if(Object.isUndefined(Effect))
  throw("dragdrop.js requires including script.aculo.us' effects.js library");

var Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = $(element);
    var options = Object.extend({
      greedy:     true,
      hoverclass: null,
      tree:       false
    }, arguments[1] || { });

    // cache containers
    if(options.containment) {
      options._containers = [];
      var containment = options.containment;
      if(Object.isArray(containment)) {
        containment.each( function(c) { options._containers.push($(c)) });
      } else {
        options._containers.push($(containment));
      }
    }

    if(options.accept) options.accept = [options.accept].flatten();

    Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },

  findDeepestChild: function(drops) {
    deepest = drops[0];

    for (i = 1; i < drops.length; ++i)
      if (Element.isParent(drops[i].element, deepest.element))
        deepest = drops[i];

    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode;
    if(drop.tree) {
      containmentNode = element.treeNode;
    } else {
      containmentNode = element.parentNode;
    }
    return drop._containers.detect(function(c) { return containmentNode == c });
  },

  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      ((!drop._containers) ||
        this.isContained(element, drop)) &&
      ((!drop.accept) ||
        (Element.classNames(element).detect(
          function(v) { return drop.accept.include(v) } ) )) &&
      Position.within(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop) {
    if(drop.hoverclass)
      Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
  },

  activate: function(drop) {
    if(drop.hoverclass)
      Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
  },

  show: function(point, element) {
    if(!this.drops.length) return;
    var drop, affected = [];

    this.drops.each( function(drop) {
      if(Droppables.isAffected(point, element, drop))
        affected.push(drop);
    });

    if(affected.length>0)
      drop = Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active);
    if (drop) {
      Position.within(drop.element, point[0], point[1]);
      if(drop.onHover)
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));

      if (drop != this.last_active) Droppables.activate(drop);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event);
        return true;
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  }
};

var Draggables = {
  drags: [],
  observers: [],

  register: function(draggable) {
    if(this.drags.length == 0) {
      this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
      this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
      this.eventKeypress  = this.keyPress.bindAsEventListener(this);

      Event.observe(document, "mouseup", this.eventMouseUp);
      Event.observe(document, "mousemove", this.eventMouseMove);
      Event.observe(document, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
  },

  unregister: function(draggable) {
    this.drags = this.drags.reject(function(d) { return d==draggable });
    if(this.drags.length == 0) {
      Event.stopObserving(document, "mouseup", this.eventMouseUp);
      Event.stopObserving(document, "mousemove", this.eventMouseMove);
      Event.stopObserving(document, "keypress", this.eventKeypress);
    }
  },

  activate: function(draggable) {
    if(draggable.options.delay) {
      this._timeout = setTimeout(function() {
        Draggables._timeout = null;
        window.focus();
        Draggables.activeDraggable = draggable;
      }.bind(this), draggable.options.delay);
    } else {
      window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
      this.activeDraggable = draggable;
    }
  },

  deactivate: function() {
    this.activeDraggable = null;
  },

  updateDrag: function(event) {
    if(!this.activeDraggable) return;
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
    // the same coordinates, prevent needless redrawing (moz bug?)
    if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;
    this._lastPointer = pointer;

    this.activeDraggable.updateDrag(event, pointer);
  },

  endDrag: function(event) {
    if(this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if(!this.activeDraggable) return;
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
  },

  keyPress: function(event) {
    if(this.activeDraggable)
      this.activeDraggable.keyPress(event);
  },

  addObserver: function(observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
  },

  removeObserver: function(element) {  // element instead of observer fixes mem leaks
    this.observers = this.observers.reject( function(o) { return o.element==element });
    this._cacheObserverCallbacks();
  },

  notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
    if(this[eventName+'Count'] > 0)
      this.observers.each( function(o) {
        if(o[eventName]) o[eventName](eventName, draggable, event);
      });
    if(draggable.options[eventName]) draggable.options[eventName](draggable, event);
  },

  _cacheObserverCallbacks: function() {
    ['onStart','onEnd','onDrag'].each( function(eventName) {
      Draggables[eventName+'Count'] = Draggables.observers.select(
        function(o) { return o[eventName]; }
      ).length;
    });
  }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create({
  initialize: function(element) {
    var defaults = {
      handle: false,
      reverteffect: function(element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;
        new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,
          queue: {scope:'_draggable', position:'end'}
        });
      },
      endeffect: function(element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity,
          queue: {scope:'_draggable', position:'end'},
          afterFinish: function(){
            Draggable._dragging[element] = false
          }
        });
      },
      zindex: 1000,
      revert: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
      delay: 0
    };

    if(!arguments[1] || Object.isUndefined(arguments[1].endeffect))
      Object.extend(defaults, {
        starteffect: function(element) {
          element._opacity = Element.getOpacity(element);
          Draggable._dragging[element] = true;
          new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7});
        }
      });

    var options = Object.extend(defaults, arguments[1] || { });

    this.element = $(element);

    if(options.handle && Object.isString(options.handle))
      this.handle = this.element.down('.'+options.handle, 0);

    if(!this.handle) this.handle = $(options.handle);
    if(!this.handle) this.handle = this.element;

    if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
      options.scroll = $(options.scroll);
      this._isScrollChild = Element.childOf(this.element, options.scroll);
    }

    Element.makePositioned(this.element); // fix IE

    this.options  = options;
    this.dragging = false;

    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);

    Draggables.register(this);
  },

  destroy: function() {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
  },

  currentDelta: function() {
    return([
      parseInt(Element.getStyle(this.element,'left') || '0'),
      parseInt(Element.getStyle(this.element,'top') || '0')]);
  },

  initDrag: function(event) {
    if(!Object.isUndefined(Draggable._dragging[this.element]) &&
      Draggable._dragging[this.element]) return;
    if(Event.isLeftClick(event)) {
      // abort on form elements, fixes a Firefox issue
      var src = Event.element(event);
      if((tag_name = src.tagName.toUpperCase()) && (
        tag_name=='INPUT' ||
        tag_name=='SELECT' ||
        tag_name=='OPTION' ||
        tag_name=='BUTTON' ||
        tag_name=='TEXTAREA')) return;

      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      var pos     = Position.cumulativeOffset(this.element);
      this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]) });

      Draggables.activate(this);
      Event.stop(event);
    }
  },

  startDrag: function(event) {
    this.dragging = true;
    if(!this.delta)
      this.delta = this.currentDelta();

    if(this.options.zindex) {
      this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);
      this.element.style.zIndex = this.options.zindex;
    }

    if(this.options.ghosting) {
      this._clone = this.element.cloneNode(true);
      this._originallyAbsolute = (this.element.getStyle('position') == 'absolute');
      if (!this._originallyAbsolute)
        Position.absolutize(this.element);
      this.element.parentNode.insertBefore(this._clone, this.element);
    }

    if(this.options.scroll) {
      if (this.options.scroll == window) {
        var where = this._getWindowScroll(this.options.scroll);
        this.originalScrollLeft = where.left;
        this.originalScrollTop = where.top;
      } else {
        this.originalScrollLeft = this.options.scroll.scrollLeft;
        this.originalScrollTop = this.options.scroll.scrollTop;
      }
    }

    Draggables.notify('onStart', this, event);

    if(this.options.starteffect) this.options.starteffect(this.element);
  },

  updateDrag: function(event, pointer) {
    if(!this.dragging) this.startDrag(event);

    if(!this.options.quiet){
      Position.prepare();
      Droppables.show(pointer, this.element);
    }

    Draggables.notify('onDrag', this, event);

    this.draw(pointer);
    if(this.options.change) this.options.change(this);

    if(this.options.scroll) {
      this.stopScrolling();

      var p;
      if (this.options.scroll == window) {
        with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
      } else {
        p = Position.page(this.options.scroll);
        p[0] += this.options.scroll.scrollLeft + Position.deltaX;
        p[1] += this.options.scroll.scrollTop + Position.deltaY;
        p.push(p[0]+this.options.scroll.offsetWidth);
        p.push(p[1]+this.options.scroll.offsetHeight);
      }
      var speed = [0,0];
      if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);
      if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);
      if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);
      if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);
      this.startScrolling(speed);
    }

    // fix AppleWebKit rendering
    if(Prototype.Browser.WebKit) window.scrollBy(0,0);

    Event.stop(event);
  },

  finishDrag: function(event, success) {
    this.dragging = false;

    if(this.options.quiet){
      Position.prepare();
      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      Droppables.show(pointer, this.element);
    }

    if(this.options.ghosting) {
      if (!this._originallyAbsolute)
        Position.relativize(this.element);
      delete this._originallyAbsolute;
      Element.remove(this._clone);
      this._clone = null;
    }

    var dropped = false;
    if(success) {
      dropped = Droppables.fire(event, this.element);
      if (!dropped) dropped = false;
    }
    if(dropped && this.options.onDropped) this.options.onDropped(this.element);
    Draggables.notify('onEnd', this, event);

    var revert = this.options.revert;
    if(revert && Object.isFunction(revert)) revert = revert(this.element);

    var d = this.currentDelta();
    if(revert && this.options.reverteffect) {
      if (dropped == 0 || revert != 'failure')
        this.options.reverteffect(this.element,
          d[1]-this.delta[1], d[0]-this.delta[0]);
    } else {
      this.delta = d;
    }

    if(this.options.zindex)
      this.element.style.zIndex = this.originalZ;

    if(this.options.endeffect)
      this.options.endeffect(this.element);

    Draggables.deactivate(this);
    Droppables.reset();
  },

  keyPress: function(event) {
    if(event.keyCode!=Event.KEY_ESC) return;
    this.finishDrag(event, false);
    Event.stop(event);
  },

  endDrag: function(event) {
    if(!this.dragging) return;
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
  },

  draw: function(point) {
    var pos = Position.cumulativeOffset(this.element);
    if(this.options.ghosting) {
      var r   = Position.realOffset(this.element);
      pos[0] += r[0] - Position.deltaX; pos[1] += r[1] - Position.deltaY;
    }

    var d = this.currentDelta();
    pos[0] -= d[0]; pos[1] -= d[1];

    if(this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
      pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;
      pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;
    }

    var p = [0,1].map(function(i){
      return (point[i]-pos[i]-this.offset[i])
    }.bind(this));

    if(this.options.snap) {
      if(Object.isFunction(this.options.snap)) {
        p = this.options.snap(p[0],p[1],this);
      } else {
      if(Object.isArray(this.options.snap)) {
        p = p.map( function(v, i) {
          return (v/this.options.snap[i]).round()*this.options.snap[i] }.bind(this));
      } else {
        p = p.map( function(v) {
          return (v/this.options.snap).round()*this.options.snap }.bind(this));
      }
    }}

    var style = this.element.style;
    if((!this.options.constraint) || (this.options.constraint=='horizontal'))
      style.left = p[0] + "px";
    if((!this.options.constraint) || (this.options.constraint=='vertical'))
      style.top  = p[1] + "px";

    if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
  },

  stopScrolling: function() {
    if(this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      Draggables._lastScrollPointer = null;
    }
  },

  startScrolling: function(speed) {
    if(!(speed[0] || speed[1])) return;
    this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
  },

  scroll: function() {
    var current = new Date();
    var delta = current - this.lastScrolled;
    this.lastScrolled = current;
    if(this.options.scroll == window) {
      with (this._getWindowScroll(this.options.scroll)) {
        if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
          var d = delta / 1000;
          this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );
        }
      }
    } else {
      this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
      this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;
    }

    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
      Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
      Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
      Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
      if (Draggables._lastScrollPointer[0] < 0)
        Draggables._lastScrollPointer[0] = 0;
      if (Draggables._lastScrollPointer[1] < 0)
        Draggables._lastScrollPointer[1] = 0;
      this.draw(Draggables._lastScrollPointer);
    }

    if(this.options.change) this.options.change(this);
  },

  _getWindowScroll: function(w) {
    var T, L, W, H;
    with (w.document) {
      if (w.document.documentElement && documentElement.scrollTop) {
        T = documentElement.scrollTop;
        L = documentElement.scrollLeft;
      } else if (w.document.body) {
        T = body.scrollTop;
        L = body.scrollLeft;
      }
      if (w.innerWidth) {
        W = w.innerWidth;
        H = w.innerHeight;
      } else if (w.document.documentElement && documentElement.clientWidth) {
        W = documentElement.clientWidth;
        H = documentElement.clientHeight;
      } else {
        W = body.offsetWidth;
        H = body.offsetHeight;
      }
    }
    return { top: T, left: L, width: W, height: H };
  }
});

Draggable._dragging = { };

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element   = $(element);
    this.observer  = observer;
    this.lastValue = Sortable.serialize(this.element);
  },

  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },

  onEnd: function() {
    Sortable.unmark();
    if(this.lastValue != Sortable.serialize(this.element))
      this.observer(this.element)
  }
});

var Sortable = {
  SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,

  sortables: { },

  _findRootElement: function(element) {
    while (element.tagName.toUpperCase() != "BODY") {
      if(element.id && Sortable.sortables[element.id]) return element;
      element = element.parentNode;
    }
  },

  options: function(element) {
    element = Sortable._findRootElement($(element));
    if(!element) return;
    return Sortable.sortables[element.id];
  },

  destroy: function(element){
    element = $(element);
    var s = Sortable.sortables[element.id];

    if(s) {
      Draggables.removeObserver(s.element);
      s.droppables.each(function(d){ Droppables.remove(d) });
      s.draggables.invoke('destroy');

      delete Sortable.sortables[s.element.id];
    }
  },

  create: function(element) {
    element = $(element);
    var options = Object.extend({
      element:     element,
      tag:         'li',       // assumes li children, override with tag: 'tagname'
      dropOnEmpty: false,
      tree:        false,
      treeTag:     'ul',
      overlap:     'vertical', // one of 'vertical', 'horizontal'
      constraint:  'vertical', // one of 'vertical', 'horizontal', false
      containment: element,    // also takes array of elements (or id's); or false
      handle:      false,      // or a CSS class
      only:        false,
      delay:       0,
      hoverclass:  null,
      ghosting:    false,
      quiet:       false,
      scroll:      false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      format:      this.SERIALIZE_RULE,

      // these take arrays of elements or ids and can be
      // used for better initialization performance
      elements:    false,
      handles:     false,

      onChange:    Prototype.emptyFunction,
      onUpdate:    Prototype.emptyFunction
    }, arguments[1] || { });

    // clear any old sortable with same element
    this.destroy(element);

    // build options for the draggables
    var options_for_draggable = {
      revert:      true,
      quiet:       options.quiet,
      scroll:      options.scroll,
      scrollSpeed: options.scrollSpeed,
      scrollSensitivity: options.scrollSensitivity,
      delay:       options.delay,
      ghosting:    options.ghosting,
      constraint:  options.constraint,
      handle:      options.handle };

    if(options.starteffect)
      options_for_draggable.starteffect = options.starteffect;

    if(options.reverteffect)
      options_for_draggable.reverteffect = options.reverteffect;
    else
      if(options.ghosting) options_for_draggable.reverteffect = function(element) {
        element.style.top  = 0;
        element.style.left = 0;
      };

    if(options.endeffect)
      options_for_draggable.endeffect = options.endeffect;

    if(options.zindex)
      options_for_draggable.zindex = options.zindex;

    // build options for the droppables
    var options_for_droppable = {
      overlap:     options.overlap,
      containment: options.containment,
      tree:        options.tree,
      hoverclass:  options.hoverclass,
      onHover:     Sortable.onHover
    };

    var options_for_tree = {
      onHover:      Sortable.onEmptyHover,
      overlap:      options.overlap,
      containment:  options.containment,
      hoverclass:   options.hoverclass
    };

    // fix for gecko engine
    Element.cleanWhitespace(element);

    options.draggables = [];
    options.droppables = [];

    // drop on empty handling
    if(options.dropOnEmpty || options.tree) {
      Droppables.add(element, options_for_tree);
      options.droppables.push(element);
    }

    (options.elements || this.findElements(element, options) || []).each( function(e,i) {
      var handle = options.handles ? $(options.handles[i]) :
        (options.handle ? $(e).select('.' + options.handle)[0] : e);
      options.draggables.push(
        new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));
      Droppables.add(e, options_for_droppable);
      if(options.tree) e.treeNode = element;
      options.droppables.push(e);
    });

    if(options.tree) {
      (Sortable.findTreeElements(element, options) || []).each( function(e) {
        Droppables.add(e, options_for_tree);
        e.treeNode = element;
        options.droppables.push(e);
      });
    }

    // keep reference
    this.sortables[element.id] = options;

    // for onupdate
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));

  },

  // return all suitable-for-sortable elements in a guaranteed order
  findElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.tag);
  },

  findTreeElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.treeTag);
  },

  onHover: function(element, dropon, overlap) {
    if(Element.isParent(dropon, element)) return;

    if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
      return;
    } else if(overlap>0.5) {
      Sortable.mark(dropon, 'before');
      if(dropon.previousSibling != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, dropon);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    } else {
      Sortable.mark(dropon, 'after');
      var nextElement = dropon.nextSibling || null;
      if(nextElement != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, nextElement);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    }
  },

  onEmptyHover: function(element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);

    if(!Element.isParent(dropon, element)) {
      var index;

      var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
      var child = null;

      if(children) {
        var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

        for (index = 0; index < children.length; index += 1) {
          if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {
            offset -= Element.offsetSize (children[index], droponOptions.overlap);
          } else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
            child = index + 1 < children.length ? children[index + 1] : null;
            break;
          } else {
            child = children[index];
            break;
          }
        }
      }

      dropon.insertBefore(element, child);

      Sortable.options(oldParentNode).onChange(element);
      droponOptions.onChange(element);
    }
  },

  unmark: function() {
    if(Sortable._marker) Sortable._marker.hide();
  },

  mark: function(dropon, position) {
    // mark on ghosting only
    var sortable = Sortable.options(dropon.parentNode);
    if(sortable && !sortable.ghosting) return;

    if(!Sortable._marker) {
      Sortable._marker =
        ($('dropmarker') || Element.extend(document.createElement('DIV'))).
          hide().addClassName('dropmarker').setStyle({position:'absolute'});
      document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }
    var offsets = Position.cumulativeOffset(dropon);
    Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});

    if(position=='after')
      if(sortable.overlap == 'horizontal')
        Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});
      else
        Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});

    Sortable._marker.show();
  },

  _tree: function(element, options, parent) {
    var children = Sortable.findElements(element, options) || [];

    for (var i = 0; i < children.length; ++i) {
      var match = children[i].id.match(options.format);

      if (!match) continue;

      var child = {
        id: encodeURIComponent(match ? match[1] : null),
        element: element,
        parent: parent,
        children: [],
        position: parent.children.length,
        container: $(children[i]).down(options.treeTag)
      };

      /* Get the element containing the children and recurse over it */
      if (child.container)
        this._tree(child.container, options, child);

      parent.children.push (child);
    }

    return parent;
  },

  tree: function(element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({
      tag: sortableOptions.tag,
      treeTag: sortableOptions.treeTag,
      only: sortableOptions.only,
      name: element.id,
      format: sortableOptions.format
    }, arguments[1] || { });

    var root = {
      id: null,
      parent: null,
      children: [],
      container: element,
      position: 0
    };

    return Sortable._tree(element, options, root);
  },

  /* Construct a [i] index for a particular node */
  _constructIndex: function(node) {
    var index = '';
    do {
      if (node.id) index = '[' + node.position + ']' + index;
    } while ((node = node.parent) != null);
    return index;
  },

  sequence: function(element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || { });

    return $(this.findElements(element, options) || []).map( function(item) {
      return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
  },

  setSequence: function(element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || { });

    var nodeMap = { };
    this.findElements(element, options).each( function(n) {
        if (n.id.match(options.format))
            nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
        n.parentNode.removeChild(n);
    });

    new_sequence.each(function(ident) {
      var n = nodeMap[ident];
      if (n) {
        n[1].appendChild(n[0]);
        delete nodeMap[ident];
      }
    });
  },

  serialize: function(element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || { });
    var name = encodeURIComponent(
      (arguments[1] && arguments[1].name) ? arguments[1].name : element.id);

    if (options.tree) {
      return Sortable.tree(element, arguments[1]).children.map( function (item) {
        return [name + Sortable._constructIndex(item) + "[id]=" +
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
      }).flatten().join('&');
    } else {
      return Sortable.sequence(element, arguments[1]).map( function(item) {
        return name + "[]=" + encodeURIComponent(item);
      }).join('&');
    }
  }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
  if (!child.parentNode || child == element) return false;
  if (child.parentNode == element) return true;
  return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {
  if(!element.hasChildNodes()) return null;
  tagName = tagName.toUpperCase();
  if(only) only = [only].flatten();
  var elements = [];
  $A(element.childNodes).each( function(e) {
    if(e.tagName && e.tagName.toUpperCase()==tagName &&
      (!only || (Element.classNames(e).detect(function(v) { return only.include(v) }))))
        elements.push(e);
    if(recursive) {
      var grandchildren = Element.findChildren(e, only, recursive, tagName);
      if(grandchildren) elements.push(grandchildren);
    }
  });

  return (elements.length>0 ? elements.flatten() : []);
};

Element.offsetSize = function (element, type) {
  return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];
};

// Copyright (c) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2008 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
//           (c) 2005-2008 Jon Tirsen (http://www.tirsen.com)
// Contributors:
//  Richard Livsey
//  Rahul Bhargava
//  Rob Wills
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// Autocompleter.Base handles all the autocompletion functionality
// that's independent of the data source for autocompletion. This
// includes drawing the autocompletion menu, observing keyboard
// and mouse events, and similar.
//
// Specific autocompleters need to provide, at the very least,
// a getUpdatedChoices function that will be invoked every time
// the text inside the monitored textbox changes. This method
// should get the text for which to provide autocompletion by
// invoking this.getToken(), NOT by directly accessing
// this.element.value. This is to allow incremental tokenized
// autocompletion. Specific auto-completion logic (AJAX, etc)
// belongs in getUpdatedChoices.
//
// Tokenized incremental autocompletion is enabled automatically
// when an autocompleter is instantiated with the 'tokens' option
// in the options parameter, e.g.:
// new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
// will incrementally autocomplete with a comma as the token.
// Additionally, ',' in the above example can be replaced with
// a token array, e.g. { tokens: [',', '\n'] } which
// enables autocompletion on multiple tokens. This is most
// useful when one of the tokens is \n (a newline), as it
// allows smart autocompletion after linebreaks.

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ new Effect.Fade(update,{duration:0.15}) };

    if(typeof(this.options.tokens) == 'string')
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix &&
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update,
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },

  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
      }
     else
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN ||
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer =
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },

  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },

  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $(selectedElement).select('.' + this.options.select) || [];
      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

    var bounds = this.getTokenBounds();
    if (bounds[0] != -1) {
      var newValue = this.element.value.substr(0, bounds[0]);
      var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value + this.element.value.substr(bounds[1]);
    } else {
      this.element.value = value;
    }
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;

      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.oldElementValue);
    var offset = (diff == this.oldElementValue.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

Autocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();

    var entry = encodeURIComponent(this.options.paramName) + '=' +
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams)
      this.options.parameters += '&' + this.options.defaultParams;

    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }
});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector'
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create(Autocompleter.Base, {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&
          ret.length < instance.options.choices ; i++) {

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ?
            elem.toLowerCase().indexOf(entry.toLowerCase()) :
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) {
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" +
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars &&
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ?
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || { });
  }
});

// AJAX in-place editor and collection editor
// Full rewrite by Christophe Porteneuve <tdd@tddsworld.com> (April 2007).

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create({
  initialize: function(element, url, options) {
    this.url = url;
    this.element = element = $(element);
    this.prepareOptions();
    this._controls = { };
    arguments.callee.dealWithDeprecatedOptions(options); // DEPRECATION LAYER!!!
    Object.extend(this.options, options || { });
    if (!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + '-inplaceeditor';
      if ($(this.options.formId))
        this.options.formId = '';
    }
    if (this.options.externalControl)
      this.options.externalControl = $(this.options.externalControl);
    if (!this.options.externalControl)
      this.options.externalControlOnly = false;
    this._originalBackground = this.element.getStyle('background-color') || 'transparent';
    this.element.title = this.options.clickToEditText;
    this._boundCancelHandler = this.handleFormCancellation.bind(this);
    this._boundComplete = (this.options.onComplete || Prototype.emptyFunction).bind(this);
    this._boundFailureHandler = this.handleAJAXFailure.bind(this);
    this._boundSubmitHandler = this.handleFormSubmission.bind(this);
    this._boundWrapperHandler = this.wrapUp.bind(this);
    this.registerListeners();
  },
  checkForEscapeOrReturn: function(e) {
    if (!this._editing || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (Event.KEY_ESC == e.keyCode)
      this.handleFormCancellation(e);
    else if (Event.KEY_RETURN == e.keyCode)
      this.handleFormSubmission(e);
  },
  createControl: function(mode, handler, extraClasses) {
    var control = this.options[mode + 'Control'];
    var text = this.options[mode + 'Text'];
    if ('button' == control) {
      var btn = document.createElement('input');
      btn.type = 'submit';
      btn.value = text;
      btn.className = 'editor_' + mode + '_button';
      if ('cancel' == mode)
        btn.onclick = this._boundCancelHandler;
      this._form.appendChild(btn);
      this._controls[mode] = btn;
    } else if ('link' == control) {
      var link = document.createElement('a');
      link.href = '#';
      link.appendChild(document.createTextNode(text));
      link.onclick = 'cancel' == mode ? this._boundCancelHandler : this._boundSubmitHandler;
      link.className = 'editor_' + mode + '_link';
      if (extraClasses)
        link.className += ' ' + extraClasses;
      this._form.appendChild(link);
      this._controls[mode] = link;
    }
  },
  createEditField: function() {
    var text = (this.options.loadTextURL ? this.options.loadingText : this.getText());
    var fld;
    if (1 >= this.options.rows && !/\r|\n/.test(this.getText())) {
      fld = document.createElement('input');
      fld.type = 'text';
      var size = this.options.size || this.options.cols || 0;
      if (0 < size) fld.size = size;
    } else {
      fld = document.createElement('textarea');
      fld.rows = (1 >= this.options.rows ? this.options.autoRows : this.options.rows);
      fld.cols = this.options.cols || 40;
    }
    fld.name = this.options.paramName;
    fld.value = text; // No HTML breaks conversion anymore
    fld.className = 'editor_field';
    if (this.options.submitOnBlur)
      fld.onblur = this._boundSubmitHandler;
    this._controls.editor = fld;
    if (this.options.loadTextURL)
      this.loadExternalText();
    this._form.appendChild(this._controls.editor);
  },
  createForm: function() {
    var ipe = this;
    function addText(mode, condition) {
      var text = ipe.options['text' + mode + 'Controls'];
      if (!text || condition === false) return;
      ipe._form.appendChild(document.createTextNode(text));
    };
    this._form = $(document.createElement('form'));
    this._form.id = this.options.formId;
    this._form.addClassName(this.options.formClassName);
    this._form.onsubmit = this._boundSubmitHandler;
    this.createEditField();
    if ('textarea' == this._controls.editor.tagName.toLowerCase())
      this._form.appendChild(document.createElement('br'));
    if (this.options.onFormCustomization)
      this.options.onFormCustomization(this, this._form);
    addText('Before', this.options.okControl || this.options.cancelControl);
    this.createControl('ok', this._boundSubmitHandler);
    addText('Between', this.options.okControl && this.options.cancelControl);
    this.createControl('cancel', this._boundCancelHandler, 'editor_cancel');
    addText('After', this.options.okControl || this.options.cancelControl);
  },
  destroy: function() {
    if (this._oldInnerHTML)
      this.element.innerHTML = this._oldInnerHTML;
    this.leaveEditMode();
    this.unregisterListeners();
  },
  enterEditMode: function(e) {
    if (this._saving || this._editing) return;
    this._editing = true;
    this.triggerCallback('onEnterEditMode');
    if (this.options.externalControl)
      this.options.externalControl.hide();
    this.element.hide();
    this.createForm();
    this.element.parentNode.insertBefore(this._form, this.element);
    if (!this.options.loadTextURL)
      this.postProcessEditField();
    if (e) Event.stop(e);
  },
  enterHover: function(e) {
    if (this.options.hoverClassName)
      this.element.addClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onEnterHover');
  },
  getText: function() {
    return this.element.innerHTML.unescapeHTML();
  },
  handleAJAXFailure: function(transport) {
    this.triggerCallback('onFailure', transport);
    if (this._oldInnerHTML) {
      this.element.innerHTML = this._oldInnerHTML;
      this._oldInnerHTML = null;
    }
  },
  handleFormCancellation: function(e) {
    this.wrapUp();
    if (e) Event.stop(e);
  },
  handleFormSubmission: function(e) {
    var form = this._form;
    var value = $F(this._controls.editor);
    this.prepareSubmission();
    var params = this.options.callback(form, value) || '';
    if (Object.isString(params))
      params = params.toQueryParams();
    params.editorId = this.element.id;
    if (this.options.htmlResponse) {
      var options = Object.extend({ evalScripts: true }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Updater({ success: this.element }, this.url, options);
    } else {
      var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Request(this.url, options);
    }
    if (e) Event.stop(e);
  },
  leaveEditMode: function() {
    this.element.removeClassName(this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
    if (this.options.externalControl)
      this.options.externalControl.show();
    this._saving = false;
    this._editing = false;
    this._oldInnerHTML = null;
    this.triggerCallback('onLeaveEditMode');
  },
  leaveHover: function(e) {
    if (this.options.hoverClassName)
      this.element.removeClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onLeaveHover');
  },
  loadExternalText: function() {
    this._form.addClassName(this.options.loadingClassName);
    this._controls.editor.disabled = true;
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._form.removeClassName(this.options.loadingClassName);
        var text = transport.responseText;
        if (this.options.stripLoadedTextTags)
          text = text.stripTags();
        this._controls.editor.value = text;
        this._controls.editor.disabled = false;
        this.postProcessEditField();
      }.bind(this),
      onFailure: this._boundFailureHandler
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },
  postProcessEditField: function() {
    var fpc = this.options.fieldPostCreation;
    if (fpc)
      $(this._controls.editor)['focus' == fpc ? 'focus' : 'activate']();
  },
  prepareOptions: function() {
    this.options = Object.clone(Ajax.InPlaceEditor.DefaultOptions);
    Object.extend(this.options, Ajax.InPlaceEditor.DefaultCallbacks);
    [this._extraDefaultOptions].flatten().compact().each(function(defs) {
      Object.extend(this.options, defs);
    }.bind(this));
  },
  prepareSubmission: function() {
    this._saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  registerListeners: function() {
    this._listeners = { };
    var listener;
    $H(Ajax.InPlaceEditor.Listeners).each(function(pair) {
      listener = this[pair.value].bind(this);
      this._listeners[pair.key] = listener;
      if (!this.options.externalControlOnly)
        this.element.observe(pair.key, listener);
      if (this.options.externalControl)
        this.options.externalControl.observe(pair.key, listener);
    }.bind(this));
  },
  removeForm: function() {
    if (!this._form) return;
    this._form.remove();
    this._form = null;
    this._controls = { };
  },
  showSaving: function() {
    this._oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    this.element.addClassName(this.options.savingClassName);
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
  },
  triggerCallback: function(cbName, arg) {
    if ('function' == typeof this.options[cbName]) {
      this.options[cbName](this, arg);
    }
  },
  unregisterListeners: function() {
    $H(this._listeners).each(function(pair) {
      if (!this.options.externalControlOnly)
        this.element.stopObserving(pair.key, pair.value);
      if (this.options.externalControl)
        this.options.externalControl.stopObserving(pair.key, pair.value);
    }.bind(this));
  },
  wrapUp: function(transport) {
    this.leaveEditMode();
    // Can't use triggerCallback due to backward compatibility: requires
    // binding + direct element
    this._boundComplete(transport, this.element);
  }
});

Object.extend(Ajax.InPlaceEditor.prototype, {
  dispose: Ajax.InPlaceEditor.prototype.destroy
});

Ajax.InPlaceCollectionEditor = Class.create(Ajax.InPlaceEditor, {
  initialize: function($super, element, url, options) {
    this._extraDefaultOptions = Ajax.InPlaceCollectionEditor.DefaultOptions;
    $super(element, url, options);
  },

  createEditField: function() {
    var list = document.createElement('select');
    list.name = this.options.paramName;
    list.size = 1;
    this._controls.editor = list;
    this._collection = this.options.collection || [];
    if (this.options.loadCollectionURL)
      this.loadCollection();
    else
      this.checkForExternalText();
    this._form.appendChild(this._controls.editor);
  },

  loadCollection: function() {
    this._form.addClassName(this.options.loadingClassName);
    this.showLoadingText(this.options.loadingCollectionText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        var js = transport.responseText.strip();
        if (!/^\[.*\]$/.test(js)) // TODO: improve sanity check
          throw('Server returned an invalid collection representation.');
        this._collection = eval(js);
        this.checkForExternalText();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadCollectionURL, options);
  },

  showLoadingText: function(text) {
    this._controls.editor.disabled = true;
    var tempOption = this._controls.editor.firstChild;
    if (!tempOption) {
      tempOption = document.createElement('option');
      tempOption.value = '';
      this._controls.editor.appendChild(tempOption);
      tempOption.selected = true;
    }
    tempOption.update((text || '').stripScripts().stripTags());
  },

  checkForExternalText: function() {
    this._text = this.getText();
    if (this.options.loadTextURL)
      this.loadExternalText();
    else
      this.buildOptionList();
  },

  loadExternalText: function() {
    this.showLoadingText(this.options.loadingText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._text = transport.responseText.strip();
        this.buildOptionList();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },

  buildOptionList: function() {
    this._form.removeClassName(this.options.loadingClassName);
    this._collection = this._collection.map(function(entry) {
      return 2 === entry.length ? entry : [entry, entry].flatten();
    });
    var marker = ('value' in this.options) ? this.options.value : this._text;
    var textFound = this._collection.any(function(entry) {
      return entry[0] == marker;
    }.bind(this));
    this._controls.editor.update('');
    var option;
    this._collection.each(function(entry, index) {
      option = document.createElement('option');
      option.value = entry[0];
      option.selected = textFound ? entry[0] == marker : 0 == index;
      option.appendChild(document.createTextNode(entry[1]));
      this._controls.editor.appendChild(option);
    }.bind(this));
    this._controls.editor.disabled = false;
    Field.scrollFreeActivate(this._controls.editor);
  }
});

//**** DEPRECATION LAYER FOR InPlace[Collection]Editor! ****
//**** This only  exists for a while,  in order to  let ****
//**** users adapt to  the new API.  Read up on the new ****
//**** API and convert your code to it ASAP!            ****

Ajax.InPlaceEditor.prototype.initialize.dealWithDeprecatedOptions = function(options) {
  if (!options) return;
  function fallback(name, expr) {
    if (name in options || expr === undefined) return;
    options[name] = expr;
  };
  fallback('cancelControl', (options.cancelLink ? 'link' : (options.cancelButton ? 'button' :
    options.cancelLink == options.cancelButton == false ? false : undefined)));
  fallback('okControl', (options.okLink ? 'link' : (options.okButton ? 'button' :
    options.okLink == options.okButton == false ? false : undefined)));
  fallback('highlightColor', options.highlightcolor);
  fallback('highlightEndColor', options.highlightendcolor);
};

Object.extend(Ajax.InPlaceEditor, {
  DefaultOptions: {
    ajaxOptions: { },
    autoRows: 3,                                // Use when multi-line w/ rows == 1
    cancelControl: 'link',                      // 'link'|'button'|false
    cancelText: 'cancel',
    clickToEditText: 'Click to edit',
    externalControl: null,                      // id|elt
    externalControlOnly: false,
    fieldPostCreation: 'activate',              // 'activate'|'focus'|false
    formClassName: 'inplaceeditor-form',
    formId: null,                               // id|elt
    highlightColor: '#ffff99',
    highlightEndColor: '#ffffff',
    hoverClassName: '',
    htmlResponse: true,
    loadingClassName: 'inplaceeditor-loading',
    loadingText: 'Loading...',
    okControl: 'button',                        // 'link'|'button'|false
    okText: 'ok',
    paramName: 'value',
    rows: 1,                                    // If 1 and multi-line, uses autoRows
    savingClassName: 'inplaceeditor-saving',
    savingText: 'Saving...',
    size: 0,
    stripLoadedTextTags: false,
    submitOnBlur: false,
    textAfterControls: '',
    textBeforeControls: '',
    textBetweenControls: ''
  },
  DefaultCallbacks: {
    callback: function(form) {
      return Form.serialize(form);
    },
    onComplete: function(transport, element) {
      // For backward compatibility, this one is bound to the IPE, and passes
      // the element directly.  It was too often customized, so we don't break it.
      new Effect.Highlight(element, {
        startcolor: this.options.highlightColor, keepBackgroundImage: true });
    },
    onEnterEditMode: null,
    onEnterHover: function(ipe) {
      ipe.element.style.backgroundColor = ipe.options.highlightColor;
      if (ipe._effect)
        ipe._effect.cancel();
    },
    onFailure: function(transport, ipe) {
      alert('Error communication with the server: ' + transport.responseText.stripTags());
    },
    onFormCustomization: null, // Takes the IPE and its generated form, after editor, before controls.
    onLeaveEditMode: null,
    onLeaveHover: function(ipe) {
      ipe._effect = new Effect.Highlight(ipe.element, {
        startcolor: ipe.options.highlightColor, endcolor: ipe.options.highlightEndColor,
        restorecolor: ipe._originalBackground, keepBackgroundImage: true
      });
    }
  },
  Listeners: {
    click: 'enterEditMode',
    keydown: 'checkForEscapeOrReturn',
    mouseover: 'enterHover',
    mouseout: 'leaveHover'
  }
});

Ajax.InPlaceCollectionEditor.DefaultOptions = {
  loadingCollectionText: 'Loading options...'
};

// Delayed observer, like Form.Element.Observer,
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create({
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element);
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
});

/*
 * jQuery JavaScript Library v1.3.2
 * http://jquery.com/
 *
 * Copyright (c) 2009 John Resig
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * Date: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
 * Revision: 6246
 */
(function(){var l=this,g,y=l.jQuery,p=l.$,o=l.jQuery=l.$=function(E,F){return new o.fn.init(E,F)},D=/^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,f=/^.[^:#\[\.,]*$/;o.fn=o.prototype={init:function(E,H){E=E||document;if(E.nodeType){this[0]=E;this.length=1;this.context=E;return this}if(typeof E==="string"){var G=D.exec(E);if(G&&(G[1]||!H)){if(G[1]){E=o.clean([G[1]],H)}else{var I=document.getElementById(G[3]);if(I&&I.id!=G[3]){return o().find(E)}var F=o(I||[]);F.context=document;F.selector=E;return F}}else{return o(H).find(E)}}else{if(o.isFunction(E)){return o(document).ready(E)}}if(E.selector&&E.context){this.selector=E.selector;this.context=E.context}return this.setArray(o.isArray(E)?E:o.makeArray(E))},selector:"",jquery:"1.3.2",size:function(){return this.length},get:function(E){return E===g?Array.prototype.slice.call(this):this[E]},pushStack:function(F,H,E){var G=o(F);G.prevObject=this;G.context=this.context;if(H==="find"){G.selector=this.selector+(this.selector?" ":"")+E}else{if(H){G.selector=this.selector+"."+H+"("+E+")"}}return G},setArray:function(E){this.length=0;Array.prototype.push.apply(this,E);return this},each:function(F,E){return o.each(this,F,E)},index:function(E){return o.inArray(E&&E.jquery?E[0]:E,this)},attr:function(F,H,G){var E=F;if(typeof F==="string"){if(H===g){return this[0]&&o[G||"attr"](this[0],F)}else{E={};E[F]=H}}return this.each(function(I){for(F in E){o.attr(G?this.style:this,F,o.prop(this,E[F],G,I,F))}})},css:function(E,F){if((E=="width"||E=="height")&&parseFloat(F)<0){F=g}return this.attr(E,F,"curCSS")},text:function(F){if(typeof F!=="object"&&F!=null){return this.empty().append((this[0]&&this[0].ownerDocument||document).createTextNode(F))}var E="";o.each(F||this,function(){o.each(this.childNodes,function(){if(this.nodeType!=8){E+=this.nodeType!=1?this.nodeValue:o.fn.text([this])}})});return E},wrapAll:function(E){if(this[0]){var F=o(E,this[0].ownerDocument).clone();if(this[0].parentNode){F.insertBefore(this[0])}F.map(function(){var G=this;while(G.firstChild){G=G.firstChild}return G}).append(this)}return this},wrapInner:function(E){return this.each(function(){o(this).contents().wrapAll(E)})},wrap:function(E){return this.each(function(){o(this).wrapAll(E)})},append:function(){return this.domManip(arguments,true,function(E){if(this.nodeType==1){this.appendChild(E)}})},prepend:function(){return this.domManip(arguments,true,function(E){if(this.nodeType==1){this.insertBefore(E,this.firstChild)}})},before:function(){return this.domManip(arguments,false,function(E){this.parentNode.insertBefore(E,this)})},after:function(){return this.domManip(arguments,false,function(E){this.parentNode.insertBefore(E,this.nextSibling)})},end:function(){return this.prevObject||o([])},push:[].push,sort:[].sort,splice:[].splice,find:function(E){if(this.length===1){var F=this.pushStack([],"find",E);F.length=0;o.find(E,this[0],F);return F}else{return this.pushStack(o.unique(o.map(this,function(G){return o.find(E,G)})),"find",E)}},clone:function(G){var E=this.map(function(){if(!o.support.noCloneEvent&&!o.isXMLDoc(this)){var I=this.outerHTML;if(!I){var J=this.ownerDocument.createElement("div");J.appendChild(this.cloneNode(true));I=J.innerHTML}return o.clean([I.replace(/ jQuery\d+="(?:\d+|null)"/g,"").replace(/^\s*/,"")])[0]}else{return this.cloneNode(true)}});if(G===true){var H=this.find("*").andSelf(),F=0;E.find("*").andSelf().each(function(){if(this.nodeName!==H[F].nodeName){return}var I=o.data(H[F],"events");for(var K in I){for(var J in I[K]){o.event.add(this,K,I[K][J],I[K][J].data)}}F++})}return E},filter:function(E){return this.pushStack(o.isFunction(E)&&o.grep(this,function(G,F){return E.call(G,F)})||o.multiFilter(E,o.grep(this,function(F){return F.nodeType===1})),"filter",E)},closest:function(E){var G=o.expr.match.POS.test(E)?o(E):null,F=0;return this.map(function(){var H=this;while(H&&H.ownerDocument){if(G?G.index(H)>-1:o(H).is(E)){o.data(H,"closest",F);return H}H=H.parentNode;F++}})},not:function(E){if(typeof E==="string"){if(f.test(E)){return this.pushStack(o.multiFilter(E,this,true),"not",E)}else{E=o.multiFilter(E,this)}}var F=E.length&&E[E.length-1]!==g&&!E.nodeType;return this.filter(function(){return F?o.inArray(this,E)<0:this!=E})},add:function(E){return this.pushStack(o.unique(o.merge(this.get(),typeof E==="string"?o(E):o.makeArray(E))))},is:function(E){return !!E&&o.multiFilter(E,this).length>0},hasClass:function(E){return !!E&&this.is("."+E)},val:function(K){if(K===g){var E=this[0];if(E){if(o.nodeName(E,"option")){return(E.attributes.value||{}).specified?E.value:E.text}if(o.nodeName(E,"select")){var I=E.selectedIndex,L=[],M=E.options,H=E.type=="select-one";if(I<0){return null}for(var F=H?I:0,J=H?I+1:M.length;F<J;F++){var G=M[F];if(G.selected){K=o(G).val();if(H){return K}L.push(K)}}return L}return(E.value||"").replace(/\r/g,"")}return g}if(typeof K==="number"){K+=""}return this.each(function(){if(this.nodeType!=1){return}if(o.isArray(K)&&/radio|checkbox/.test(this.type)){this.checked=(o.inArray(this.value,K)>=0||o.inArray(this.name,K)>=0)}else{if(o.nodeName(this,"select")){var N=o.makeArray(K);o("option",this).each(function(){this.selected=(o.inArray(this.value,N)>=0||o.inArray(this.text,N)>=0)});if(!N.length){this.selectedIndex=-1}}else{this.value=K}}})},html:function(E){return E===g?(this[0]?this[0].innerHTML.replace(/ jQuery\d+="(?:\d+|null)"/g,""):null):this.empty().append(E)},replaceWith:function(E){return this.after(E).remove()},eq:function(E){return this.slice(E,+E+1)},slice:function(){return this.pushStack(Array.prototype.slice.apply(this,arguments),"slice",Array.prototype.slice.call(arguments).join(","))},map:function(E){return this.pushStack(o.map(this,function(G,F){return E.call(G,F,G)}))},andSelf:function(){return this.add(this.prevObject)},domManip:function(J,M,L){if(this[0]){var I=(this[0].ownerDocument||this[0]).createDocumentFragment(),F=o.clean(J,(this[0].ownerDocument||this[0]),I),H=I.firstChild;if(H){for(var G=0,E=this.length;G<E;G++){L.call(K(this[G],H),this.length>1||G>0?I.cloneNode(true):I)}}if(F){o.each(F,z)}}return this;function K(N,O){return M&&o.nodeName(N,"table")&&o.nodeName(O,"tr")?(N.getElementsByTagName("tbody")[0]||N.appendChild(N.ownerDocument.createElement("tbody"))):N}}};o.fn.init.prototype=o.fn;function z(E,F){if(F.src){o.ajax({url:F.src,async:false,dataType:"script"})}else{o.globalEval(F.text||F.textContent||F.innerHTML||"")}if(F.parentNode){F.parentNode.removeChild(F)}}function e(){return +new Date}o.extend=o.fn.extend=function(){var J=arguments[0]||{},H=1,I=arguments.length,E=false,G;if(typeof J==="boolean"){E=J;J=arguments[1]||{};H=2}if(typeof J!=="object"&&!o.isFunction(J)){J={}}if(I==H){J=this;--H}for(;H<I;H++){if((G=arguments[H])!=null){for(var F in G){var K=J[F],L=G[F];if(J===L){continue}if(E&&L&&typeof L==="object"&&!L.nodeType){J[F]=o.extend(E,K||(L.length!=null?[]:{}),L)}else{if(L!==g){J[F]=L}}}}}return J};var b=/z-?index|font-?weight|opacity|zoom|line-?height/i,q=document.defaultView||{},s=Object.prototype.toString;o.extend({noConflict:function(E){l.$=p;if(E){l.jQuery=y}return o},isFunction:function(E){return s.call(E)==="[object Function]"},isArray:function(E){return s.call(E)==="[object Array]"},isXMLDoc:function(E){return E.nodeType===9&&E.documentElement.nodeName!=="HTML"||!!E.ownerDocument&&o.isXMLDoc(E.ownerDocument)},globalEval:function(G){if(G&&/\S/.test(G)){var F=document.getElementsByTagName("head")[0]||document.documentElement,E=document.createElement("script");E.type="text/javascript";if(o.support.scriptEval){E.appendChild(document.createTextNode(G))}else{E.text=G}F.insertBefore(E,F.firstChild);F.removeChild(E)}},nodeName:function(F,E){return F.nodeName&&F.nodeName.toUpperCase()==E.toUpperCase()},each:function(G,K,F){var E,H=0,I=G.length;if(F){if(I===g){for(E in G){if(K.apply(G[E],F)===false){break}}}else{for(;H<I;){if(K.apply(G[H++],F)===false){break}}}}else{if(I===g){for(E in G){if(K.call(G[E],E,G[E])===false){break}}}else{for(var J=G[0];H<I&&K.call(J,H,J)!==false;J=G[++H]){}}}return G},prop:function(H,I,G,F,E){if(o.isFunction(I)){I=I.call(H,F)}return typeof I==="number"&&G=="curCSS"&&!b.test(E)?I+"px":I},className:{add:function(E,F){o.each((F||"").split(/\s+/),function(G,H){if(E.nodeType==1&&!o.className.has(E.className,H)){E.className+=(E.className?" ":"")+H}})},remove:function(E,F){if(E.nodeType==1){E.className=F!==g?o.grep(E.className.split(/\s+/),function(G){return !o.className.has(F,G)}).join(" "):""}},has:function(F,E){return F&&o.inArray(E,(F.className||F).toString().split(/\s+/))>-1}},swap:function(H,G,I){var E={};for(var F in G){E[F]=H.style[F];H.style[F]=G[F]}I.call(H);for(var F in G){H.style[F]=E[F]}},css:function(H,F,J,E){if(F=="width"||F=="height"){var L,G={position:"absolute",visibility:"hidden",display:"block"},K=F=="width"?["Left","Right"]:["Top","Bottom"];function I(){L=F=="width"?H.offsetWidth:H.offsetHeight;if(E==="border"){return}o.each(K,function(){if(!E){L-=parseFloat(o.curCSS(H,"padding"+this,true))||0}if(E==="margin"){L+=parseFloat(o.curCSS(H,"margin"+this,true))||0}else{L-=parseFloat(o.curCSS(H,"border"+this+"Width",true))||0}})}if(H.offsetWidth!==0){I()}else{o.swap(H,G,I)}return Math.max(0,Math.round(L))}return o.curCSS(H,F,J)},curCSS:function(I,F,G){var L,E=I.style;if(F=="opacity"&&!o.support.opacity){L=o.attr(E,"opacity");return L==""?"1":L}if(F.match(/float/i)){F=w}if(!G&&E&&E[F]){L=E[F]}else{if(q.getComputedStyle){if(F.match(/float/i)){F="float"}F=F.replace(/([A-Z])/g,"-$1").toLowerCase();var M=q.getComputedStyle(I,null);if(M){L=M.getPropertyValue(F)}if(F=="opacity"&&L==""){L="1"}}else{if(I.currentStyle){var J=F.replace(/\-(\w)/g,function(N,O){return O.toUpperCase()});L=I.currentStyle[F]||I.currentStyle[J];if(!/^\d+(px)?$/i.test(L)&&/^\d/.test(L)){var H=E.left,K=I.runtimeStyle.left;I.runtimeStyle.left=I.currentStyle.left;E.left=L||0;L=E.pixelLeft+"px";E.left=H;I.runtimeStyle.left=K}}}}return L},clean:function(F,K,I){K=K||document;if(typeof K.createElement==="undefined"){K=K.ownerDocument||K[0]&&K[0].ownerDocument||document}if(!I&&F.length===1&&typeof F[0]==="string"){var H=/^<(\w+)\s*\/?>$/.exec(F[0]);if(H){return[K.createElement(H[1])]}}var G=[],E=[],L=K.createElement("div");o.each(F,function(P,S){if(typeof S==="number"){S+=""}if(!S){return}if(typeof S==="string"){S=S.replace(/(<(\w+)[^>]*?)\/>/g,function(U,V,T){return T.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?U:V+"></"+T+">"});var O=S.replace(/^\s+/,"").substring(0,10).toLowerCase();var Q=!O.indexOf("<opt")&&[1,"<select multiple='multiple'>","</select>"]||!O.indexOf("<leg")&&[1,"<fieldset>","</fieldset>"]||O.match(/^<(thead|tbody|tfoot|colg|cap)/)&&[1,"<table>","</table>"]||!O.indexOf("<tr")&&[2,"<table><tbody>","</tbody></table>"]||(!O.indexOf("<td")||!O.indexOf("<th"))&&[3,"<table><tbody><tr>","</tr></tbody></table>"]||!O.indexOf("<col")&&[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"]||!o.support.htmlSerialize&&[1,"div<div>","</div>"]||[0,"",""];L.innerHTML=Q[1]+S+Q[2];while(Q[0]--){L=L.lastChild}if(!o.support.tbody){var R=/<tbody/i.test(S),N=!O.indexOf("<table")&&!R?L.firstChild&&L.firstChild.childNodes:Q[1]=="<table>"&&!R?L.childNodes:[];for(var M=N.length-1;M>=0;--M){if(o.nodeName(N[M],"tbody")&&!N[M].childNodes.length){N[M].parentNode.removeChild(N[M])}}}if(!o.support.leadingWhitespace&&/^\s/.test(S)){L.insertBefore(K.createTextNode(S.match(/^\s*/)[0]),L.firstChild)}S=o.makeArray(L.childNodes)}if(S.nodeType){G.push(S)}else{G=o.merge(G,S)}});if(I){for(var J=0;G[J];J++){if(o.nodeName(G[J],"script")&&(!G[J].type||G[J].type.toLowerCase()==="text/javascript")){E.push(G[J].parentNode?G[J].parentNode.removeChild(G[J]):G[J])}else{if(G[J].nodeType===1){G.splice.apply(G,[J+1,0].concat(o.makeArray(G[J].getElementsByTagName("script"))))}I.appendChild(G[J])}}return E}return G},attr:function(J,G,K){if(!J||J.nodeType==3||J.nodeType==8){return g}var H=!o.isXMLDoc(J),L=K!==g;G=H&&o.props[G]||G;if(J.tagName){var F=/href|src|style/.test(G);if(G=="selected"&&J.parentNode){J.parentNode.selectedIndex}if(G in J&&H&&!F){if(L){if(G=="type"&&o.nodeName(J,"input")&&J.parentNode){throw"type property can't be changed"}J[G]=K}if(o.nodeName(J,"form")&&J.getAttributeNode(G)){return J.getAttributeNode(G).nodeValue}if(G=="tabIndex"){var I=J.getAttributeNode("tabIndex");return I&&I.specified?I.value:J.nodeName.match(/(button|input|object|select|textarea)/i)?0:J.nodeName.match(/^(a|area)$/i)&&J.href?0:g}return J[G]}if(!o.support.style&&H&&G=="style"){return o.attr(J.style,"cssText",K)}if(L){J.setAttribute(G,""+K)}var E=!o.support.hrefNormalized&&H&&F?J.getAttribute(G,2):J.getAttribute(G);return E===null?g:E}if(!o.support.opacity&&G=="opacity"){if(L){J.zoom=1;J.filter=(J.filter||"").replace(/alpha\([^)]*\)/,"")+(parseInt(K)+""=="NaN"?"":"alpha(opacity="+K*100+")")}return J.filter&&J.filter.indexOf("opacity=")>=0?(parseFloat(J.filter.match(/opacity=([^)]*)/)[1])/100)+"":""}G=G.replace(/-([a-z])/ig,function(M,N){return N.toUpperCase()});if(L){J[G]=K}return J[G]},trim:function(E){return(E||"").replace(/^\s+|\s+$/g,"")},makeArray:function(G){var E=[];if(G!=null){var F=G.length;if(F==null||typeof G==="string"||o.isFunction(G)||G.setInterval){E[0]=G}else{while(F){E[--F]=G[F]}}}return E},inArray:function(G,H){for(var E=0,F=H.length;E<F;E++){if(H[E]===G){return E}}return -1},merge:function(H,E){var F=0,G,I=H.length;if(!o.support.getAll){while((G=E[F++])!=null){if(G.nodeType!=8){H[I++]=G}}}else{while((G=E[F++])!=null){H[I++]=G}}return H},unique:function(K){var F=[],E={};try{for(var G=0,H=K.length;G<H;G++){var J=o.data(K[G]);if(!E[J]){E[J]=true;F.push(K[G])}}}catch(I){F=K}return F},grep:function(F,J,E){var G=[];for(var H=0,I=F.length;H<I;H++){if(!E!=!J(F[H],H)){G.push(F[H])}}return G},map:function(E,J){var F=[];for(var G=0,H=E.length;G<H;G++){var I=J(E[G],G);if(I!=null){F[F.length]=I}}return F.concat.apply([],F)}});var C=navigator.userAgent.toLowerCase();o.browser={version:(C.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[0,"0"])[1],safari:/webkit/.test(C),opera:/opera/.test(C),msie:/msie/.test(C)&&!/opera/.test(C),mozilla:/mozilla/.test(C)&&!/(compatible|webkit)/.test(C)};o.each({parent:function(E){return E.parentNode},parents:function(E){return o.dir(E,"parentNode")},next:function(E){return o.nth(E,2,"nextSibling")},prev:function(E){return o.nth(E,2,"previousSibling")},nextAll:function(E){return o.dir(E,"nextSibling")},prevAll:function(E){return o.dir(E,"previousSibling")},siblings:function(E){return o.sibling(E.parentNode.firstChild,E)},children:function(E){return o.sibling(E.firstChild)},contents:function(E){return o.nodeName(E,"iframe")?E.contentDocument||E.contentWindow.document:o.makeArray(E.childNodes)}},function(E,F){o.fn[E]=function(G){var H=o.map(this,F);if(G&&typeof G=="string"){H=o.multiFilter(G,H)}return this.pushStack(o.unique(H),E,G)}});o.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(E,F){o.fn[E]=function(G){var J=[],L=o(G);for(var K=0,H=L.length;K<H;K++){var I=(K>0?this.clone(true):this).get();o.fn[F].apply(o(L[K]),I);J=J.concat(I)}return this.pushStack(J,E,G)}});o.each({removeAttr:function(E){o.attr(this,E,"");if(this.nodeType==1){this.removeAttribute(E)}},addClass:function(E){o.className.add(this,E)},removeClass:function(E){o.className.remove(this,E)},toggleClass:function(F,E){if(typeof E!=="boolean"){E=!o.className.has(this,F)}o.className[E?"add":"remove"](this,F)},remove:function(E){if(!E||o.filter(E,[this]).length){o("*",this).add([this]).each(function(){o.event.remove(this);o.removeData(this)});if(this.parentNode){this.parentNode.removeChild(this)}}},empty:function(){o(this).children().remove();while(this.firstChild){this.removeChild(this.firstChild)}}},function(E,F){o.fn[E]=function(){return this.each(F,arguments)}});function j(E,F){return E[0]&&parseInt(o.curCSS(E[0],F,true),10)||0}var h="jQuery"+e(),v=0,A={};o.extend({cache:{},data:function(F,E,G){F=F==l?A:F;var H=F[h];if(!H){H=F[h]=++v}if(E&&!o.cache[H]){o.cache[H]={}}if(G!==g){o.cache[H][E]=G}return E?o.cache[H][E]:H},removeData:function(F,E){F=F==l?A:F;var H=F[h];if(E){if(o.cache[H]){delete o.cache[H][E];E="";for(E in o.cache[H]){break}if(!E){o.removeData(F)}}}else{try{delete F[h]}catch(G){if(F.removeAttribute){F.removeAttribute(h)}}delete o.cache[H]}},queue:function(F,E,H){if(F){E=(E||"fx")+"queue";var G=o.data(F,E);if(!G||o.isArray(H)){G=o.data(F,E,o.makeArray(H))}else{if(H){G.push(H)}}}return G},dequeue:function(H,G){var E=o.queue(H,G),F=E.shift();if(!G||G==="fx"){F=E[0]}if(F!==g){F.call(H)}}});o.fn.extend({data:function(E,G){var H=E.split(".");H[1]=H[1]?"."+H[1]:"";if(G===g){var F=this.triggerHandler("getData"+H[1]+"!",[H[0]]);if(F===g&&this.length){F=o.data(this[0],E)}return F===g&&H[1]?this.data(H[0]):F}else{return this.trigger("setData"+H[1]+"!",[H[0],G]).each(function(){o.data(this,E,G)})}},removeData:function(E){return this.each(function(){o.removeData(this,E)})},queue:function(E,F){if(typeof E!=="string"){F=E;E="fx"}if(F===g){return o.queue(this[0],E)}return this.each(function(){var G=o.queue(this,E,F);if(E=="fx"&&G.length==1){G[0].call(this)}})},dequeue:function(E){return this.each(function(){o.dequeue(this,E)})}});
/*
 * Sizzle CSS Selector Engine - v0.9.3
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){var R=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,L=0,H=Object.prototype.toString;var F=function(Y,U,ab,ac){ab=ab||[];U=U||document;if(U.nodeType!==1&&U.nodeType!==9){return[]}if(!Y||typeof Y!=="string"){return ab}var Z=[],W,af,ai,T,ad,V,X=true;R.lastIndex=0;while((W=R.exec(Y))!==null){Z.push(W[1]);if(W[2]){V=RegExp.rightContext;break}}if(Z.length>1&&M.exec(Y)){if(Z.length===2&&I.relative[Z[0]]){af=J(Z[0]+Z[1],U)}else{af=I.relative[Z[0]]?[U]:F(Z.shift(),U);while(Z.length){Y=Z.shift();if(I.relative[Y]){Y+=Z.shift()}af=J(Y,af)}}}else{var ae=ac?{expr:Z.pop(),set:E(ac)}:F.find(Z.pop(),Z.length===1&&U.parentNode?U.parentNode:U,Q(U));af=F.filter(ae.expr,ae.set);if(Z.length>0){ai=E(af)}else{X=false}while(Z.length){var ah=Z.pop(),ag=ah;if(!I.relative[ah]){ah=""}else{ag=Z.pop()}if(ag==null){ag=U}I.relative[ah](ai,ag,Q(U))}}if(!ai){ai=af}if(!ai){throw"Syntax error, unrecognized expression: "+(ah||Y)}if(H.call(ai)==="[object Array]"){if(!X){ab.push.apply(ab,ai)}else{if(U.nodeType===1){for(var aa=0;ai[aa]!=null;aa++){if(ai[aa]&&(ai[aa]===true||ai[aa].nodeType===1&&K(U,ai[aa]))){ab.push(af[aa])}}}else{for(var aa=0;ai[aa]!=null;aa++){if(ai[aa]&&ai[aa].nodeType===1){ab.push(af[aa])}}}}}else{E(ai,ab)}if(V){F(V,U,ab,ac);if(G){hasDuplicate=false;ab.sort(G);if(hasDuplicate){for(var aa=1;aa<ab.length;aa++){if(ab[aa]===ab[aa-1]){ab.splice(aa--,1)}}}}}return ab};F.matches=function(T,U){return F(T,null,null,U)};F.find=function(aa,T,ab){var Z,X;if(!aa){return[]}for(var W=0,V=I.order.length;W<V;W++){var Y=I.order[W],X;if((X=I.match[Y].exec(aa))){var U=RegExp.leftContext;if(U.substr(U.length-1)!=="\\"){X[1]=(X[1]||"").replace(/\\/g,"");Z=I.find[Y](X,T,ab);if(Z!=null){aa=aa.replace(I.match[Y],"");break}}}}if(!Z){Z=T.getElementsByTagName("*")}return{set:Z,expr:aa}};F.filter=function(ad,ac,ag,W){var V=ad,ai=[],aa=ac,Y,T,Z=ac&&ac[0]&&Q(ac[0]);while(ad&&ac.length){for(var ab in I.filter){if((Y=I.match[ab].exec(ad))!=null){var U=I.filter[ab],ah,af;T=false;if(aa==ai){ai=[]}if(I.preFilter[ab]){Y=I.preFilter[ab](Y,aa,ag,ai,W,Z);if(!Y){T=ah=true}else{if(Y===true){continue}}}if(Y){for(var X=0;(af=aa[X])!=null;X++){if(af){ah=U(af,Y,X,aa);var ae=W^!!ah;if(ag&&ah!=null){if(ae){T=true}else{aa[X]=false}}else{if(ae){ai.push(af);T=true}}}}}if(ah!==g){if(!ag){aa=ai}ad=ad.replace(I.match[ab],"");if(!T){return[]}break}}}if(ad==V){if(T==null){throw"Syntax error, unrecognized expression: "+ad}else{break}}V=ad}return aa};var I=F.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(T){return T.getAttribute("href")}},relative:{"+":function(aa,T,Z){var X=typeof T==="string",ab=X&&!/\W/.test(T),Y=X&&!ab;if(ab&&!Z){T=T.toUpperCase()}for(var W=0,V=aa.length,U;W<V;W++){if((U=aa[W])){while((U=U.previousSibling)&&U.nodeType!==1){}aa[W]=Y||U&&U.nodeName===T?U||false:U===T}}if(Y){F.filter(T,aa,true)}},">":function(Z,U,aa){var X=typeof U==="string";if(X&&!/\W/.test(U)){U=aa?U:U.toUpperCase();for(var V=0,T=Z.length;V<T;V++){var Y=Z[V];if(Y){var W=Y.parentNode;Z[V]=W.nodeName===U?W:false}}}else{for(var V=0,T=Z.length;V<T;V++){var Y=Z[V];if(Y){Z[V]=X?Y.parentNode:Y.parentNode===U}}if(X){F.filter(U,Z,true)}}},"":function(W,U,Y){var V=L++,T=S;if(!U.match(/\W/)){var X=U=Y?U:U.toUpperCase();T=P}T("parentNode",U,V,W,X,Y)},"~":function(W,U,Y){var V=L++,T=S;if(typeof U==="string"&&!U.match(/\W/)){var X=U=Y?U:U.toUpperCase();T=P}T("previousSibling",U,V,W,X,Y)}},find:{ID:function(U,V,W){if(typeof V.getElementById!=="undefined"&&!W){var T=V.getElementById(U[1]);return T?[T]:[]}},NAME:function(V,Y,Z){if(typeof Y.getElementsByName!=="undefined"){var U=[],X=Y.getElementsByName(V[1]);for(var W=0,T=X.length;W<T;W++){if(X[W].getAttribute("name")===V[1]){U.push(X[W])}}return U.length===0?null:U}},TAG:function(T,U){return U.getElementsByTagName(T[1])}},preFilter:{CLASS:function(W,U,V,T,Z,aa){W=" "+W[1].replace(/\\/g,"")+" ";if(aa){return W}for(var X=0,Y;(Y=U[X])!=null;X++){if(Y){if(Z^(Y.className&&(" "+Y.className+" ").indexOf(W)>=0)){if(!V){T.push(Y)}}else{if(V){U[X]=false}}}}return false},ID:function(T){return T[1].replace(/\\/g,"")},TAG:function(U,T){for(var V=0;T[V]===false;V++){}return T[V]&&Q(T[V])?U[1]:U[1].toUpperCase()},CHILD:function(T){if(T[1]=="nth"){var U=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(T[2]=="even"&&"2n"||T[2]=="odd"&&"2n+1"||!/\D/.test(T[2])&&"0n+"+T[2]||T[2]);T[2]=(U[1]+(U[2]||1))-0;T[3]=U[3]-0}T[0]=L++;return T},ATTR:function(X,U,V,T,Y,Z){var W=X[1].replace(/\\/g,"");if(!Z&&I.attrMap[W]){X[1]=I.attrMap[W]}if(X[2]==="~="){X[4]=" "+X[4]+" "}return X},PSEUDO:function(X,U,V,T,Y){if(X[1]==="not"){if(X[3].match(R).length>1||/^\w/.test(X[3])){X[3]=F(X[3],null,null,U)}else{var W=F.filter(X[3],U,V,true^Y);if(!V){T.push.apply(T,W)}return false}}else{if(I.match.POS.test(X[0])||I.match.CHILD.test(X[0])){return true}}return X},POS:function(T){T.unshift(true);return T}},filters:{enabled:function(T){return T.disabled===false&&T.type!=="hidden"},disabled:function(T){return T.disabled===true},checked:function(T){return T.checked===true},selected:function(T){T.parentNode.selectedIndex;return T.selected===true},parent:function(T){return !!T.firstChild},empty:function(T){return !T.firstChild},has:function(V,U,T){return !!F(T[3],V).length},header:function(T){return/h\d/i.test(T.nodeName)},text:function(T){return"text"===T.type},radio:function(T){return"radio"===T.type},checkbox:function(T){return"checkbox"===T.type},file:function(T){return"file"===T.type},password:function(T){return"password"===T.type},submit:function(T){return"submit"===T.type},image:function(T){return"image"===T.type},reset:function(T){return"reset"===T.type},button:function(T){return"button"===T.type||T.nodeName.toUpperCase()==="BUTTON"},input:function(T){return/input|select|textarea|button/i.test(T.nodeName)}},setFilters:{first:function(U,T){return T===0},last:function(V,U,T,W){return U===W.length-1},even:function(U,T){return T%2===0},odd:function(U,T){return T%2===1},lt:function(V,U,T){return U<T[3]-0},gt:function(V,U,T){return U>T[3]-0},nth:function(V,U,T){return T[3]-0==U},eq:function(V,U,T){return T[3]-0==U}},filter:{PSEUDO:function(Z,V,W,aa){var U=V[1],X=I.filters[U];if(X){return X(Z,W,V,aa)}else{if(U==="contains"){return(Z.textContent||Z.innerText||"").indexOf(V[3])>=0}else{if(U==="not"){var Y=V[3];for(var W=0,T=Y.length;W<T;W++){if(Y[W]===Z){return false}}return true}}}},CHILD:function(T,W){var Z=W[1],U=T;switch(Z){case"only":case"first":while(U=U.previousSibling){if(U.nodeType===1){return false}}if(Z=="first"){return true}U=T;case"last":while(U=U.nextSibling){if(U.nodeType===1){return false}}return true;case"nth":var V=W[2],ac=W[3];if(V==1&&ac==0){return true}var Y=W[0],ab=T.parentNode;if(ab&&(ab.sizcache!==Y||!T.nodeIndex)){var X=0;for(U=ab.firstChild;U;U=U.nextSibling){if(U.nodeType===1){U.nodeIndex=++X}}ab.sizcache=Y}var aa=T.nodeIndex-ac;if(V==0){return aa==0}else{return(aa%V==0&&aa/V>=0)}}},ID:function(U,T){return U.nodeType===1&&U.getAttribute("id")===T},TAG:function(U,T){return(T==="*"&&U.nodeType===1)||U.nodeName===T},CLASS:function(U,T){return(" "+(U.className||U.getAttribute("class"))+" ").indexOf(T)>-1},ATTR:function(Y,W){var V=W[1],T=I.attrHandle[V]?I.attrHandle[V](Y):Y[V]!=null?Y[V]:Y.getAttribute(V),Z=T+"",X=W[2],U=W[4];return T==null?X==="!=":X==="="?Z===U:X==="*="?Z.indexOf(U)>=0:X==="~="?(" "+Z+" ").indexOf(U)>=0:!U?Z&&T!==false:X==="!="?Z!=U:X==="^="?Z.indexOf(U)===0:X==="$="?Z.substr(Z.length-U.length)===U:X==="|="?Z===U||Z.substr(0,U.length+1)===U+"-":false},POS:function(X,U,V,Y){var T=U[2],W=I.setFilters[T];if(W){return W(X,V,U,Y)}}}};var M=I.match.POS;for(var O in I.match){I.match[O]=RegExp(I.match[O].source+/(?![^\[]*\])(?![^\(]*\))/.source)}var E=function(U,T){U=Array.prototype.slice.call(U);if(T){T.push.apply(T,U);return T}return U};try{Array.prototype.slice.call(document.documentElement.childNodes)}catch(N){E=function(X,W){var U=W||[];if(H.call(X)==="[object Array]"){Array.prototype.push.apply(U,X)}else{if(typeof X.length==="number"){for(var V=0,T=X.length;V<T;V++){U.push(X[V])}}else{for(var V=0;X[V];V++){U.push(X[V])}}}return U}}var G;if(document.documentElement.compareDocumentPosition){G=function(U,T){var V=U.compareDocumentPosition(T)&4?-1:U===T?0:1;if(V===0){hasDuplicate=true}return V}}else{if("sourceIndex" in document.documentElement){G=function(U,T){var V=U.sourceIndex-T.sourceIndex;if(V===0){hasDuplicate=true}return V}}else{if(document.createRange){G=function(W,U){var V=W.ownerDocument.createRange(),T=U.ownerDocument.createRange();V.selectNode(W);V.collapse(true);T.selectNode(U);T.collapse(true);var X=V.compareBoundaryPoints(Range.START_TO_END,T);if(X===0){hasDuplicate=true}return X}}}}(function(){var U=document.createElement("form"),V="script"+(new Date).getTime();U.innerHTML="<input name='"+V+"'/>";var T=document.documentElement;T.insertBefore(U,T.firstChild);if(!!document.getElementById(V)){I.find.ID=function(X,Y,Z){if(typeof Y.getElementById!=="undefined"&&!Z){var W=Y.getElementById(X[1]);return W?W.id===X[1]||typeof W.getAttributeNode!=="undefined"&&W.getAttributeNode("id").nodeValue===X[1]?[W]:g:[]}};I.filter.ID=function(Y,W){var X=typeof Y.getAttributeNode!=="undefined"&&Y.getAttributeNode("id");return Y.nodeType===1&&X&&X.nodeValue===W}}T.removeChild(U)})();(function(){var T=document.createElement("div");T.appendChild(document.createComment(""));if(T.getElementsByTagName("*").length>0){I.find.TAG=function(U,Y){var X=Y.getElementsByTagName(U[1]);if(U[1]==="*"){var W=[];for(var V=0;X[V];V++){if(X[V].nodeType===1){W.push(X[V])}}X=W}return X}}T.innerHTML="<a href='#'></a>";if(T.firstChild&&typeof T.firstChild.getAttribute!=="undefined"&&T.firstChild.getAttribute("href")!=="#"){I.attrHandle.href=function(U){return U.getAttribute("href",2)}}})();if(document.querySelectorAll){(function(){var T=F,U=document.createElement("div");U.innerHTML="<p class='TEST'></p>";if(U.querySelectorAll&&U.querySelectorAll(".TEST").length===0){return}F=function(Y,X,V,W){X=X||document;if(!W&&X.nodeType===9&&!Q(X)){try{return E(X.querySelectorAll(Y),V)}catch(Z){}}return T(Y,X,V,W)};F.find=T.find;F.filter=T.filter;F.selectors=T.selectors;F.matches=T.matches})()}if(document.getElementsByClassName&&document.documentElement.getElementsByClassName){(function(){var T=document.createElement("div");T.innerHTML="<div class='test e'></div><div class='test'></div>";if(T.getElementsByClassName("e").length===0){return}T.lastChild.className="e";if(T.getElementsByClassName("e").length===1){return}I.order.splice(1,0,"CLASS");I.find.CLASS=function(U,V,W){if(typeof V.getElementsByClassName!=="undefined"&&!W){return V.getElementsByClassName(U[1])}}})()}function P(U,Z,Y,ad,aa,ac){var ab=U=="previousSibling"&&!ac;for(var W=0,V=ad.length;W<V;W++){var T=ad[W];if(T){if(ab&&T.nodeType===1){T.sizcache=Y;T.sizset=W}T=T[U];var X=false;while(T){if(T.sizcache===Y){X=ad[T.sizset];break}if(T.nodeType===1&&!ac){T.sizcache=Y;T.sizset=W}if(T.nodeName===Z){X=T;break}T=T[U]}ad[W]=X}}}function S(U,Z,Y,ad,aa,ac){var ab=U=="previousSibling"&&!ac;for(var W=0,V=ad.length;W<V;W++){var T=ad[W];if(T){if(ab&&T.nodeType===1){T.sizcache=Y;T.sizset=W}T=T[U];var X=false;while(T){if(T.sizcache===Y){X=ad[T.sizset];break}if(T.nodeType===1){if(!ac){T.sizcache=Y;T.sizset=W}if(typeof Z!=="string"){if(T===Z){X=true;break}}else{if(F.filter(Z,[T]).length>0){X=T;break}}}T=T[U]}ad[W]=X}}}var K=document.compareDocumentPosition?function(U,T){return U.compareDocumentPosition(T)&16}:function(U,T){return U!==T&&(U.contains?U.contains(T):true)};var Q=function(T){return T.nodeType===9&&T.documentElement.nodeName!=="HTML"||!!T.ownerDocument&&Q(T.ownerDocument)};var J=function(T,aa){var W=[],X="",Y,V=aa.nodeType?[aa]:aa;while((Y=I.match.PSEUDO.exec(T))){X+=Y[0];T=T.replace(I.match.PSEUDO,"")}T=I.relative[T]?T+"*":T;for(var Z=0,U=V.length;Z<U;Z++){F(T,V[Z],W)}return F.filter(X,W)};o.find=F;o.filter=F.filter;o.expr=F.selectors;o.expr[":"]=o.expr.filters;F.selectors.filters.hidden=function(T){return T.offsetWidth===0||T.offsetHeight===0};F.selectors.filters.visible=function(T){return T.offsetWidth>0||T.offsetHeight>0};F.selectors.filters.animated=function(T){return o.grep(o.timers,function(U){return T===U.elem}).length};o.multiFilter=function(V,T,U){if(U){V=":not("+V+")"}return F.matches(V,T)};o.dir=function(V,U){var T=[],W=V[U];while(W&&W!=document){if(W.nodeType==1){T.push(W)}W=W[U]}return T};o.nth=function(X,T,V,W){T=T||1;var U=0;for(;X;X=X[V]){if(X.nodeType==1&&++U==T){break}}return X};o.sibling=function(V,U){var T=[];for(;V;V=V.nextSibling){if(V.nodeType==1&&V!=U){T.push(V)}}return T};return;l.Sizzle=F})();o.event={add:function(I,F,H,K){if(I.nodeType==3||I.nodeType==8){return}if(I.setInterval&&I!=l){I=l}if(!H.guid){H.guid=this.guid++}if(K!==g){var G=H;H=this.proxy(G);H.data=K}var E=o.data(I,"events")||o.data(I,"events",{}),J=o.data(I,"handle")||o.data(I,"handle",function(){return typeof o!=="undefined"&&!o.event.triggered?o.event.handle.apply(arguments.callee.elem,arguments):g});J.elem=I;o.each(F.split(/\s+/),function(M,N){var O=N.split(".");N=O.shift();H.type=O.slice().sort().join(".");var L=E[N];if(o.event.specialAll[N]){o.event.specialAll[N].setup.call(I,K,O)}if(!L){L=E[N]={};if(!o.event.special[N]||o.event.special[N].setup.call(I,K,O)===false){if(I.addEventListener){I.addEventListener(N,J,false)}else{if(I.attachEvent){I.attachEvent("on"+N,J)}}}}L[H.guid]=H;o.event.global[N]=true});I=null},guid:1,global:{},remove:function(K,H,J){if(K.nodeType==3||K.nodeType==8){return}var G=o.data(K,"events"),F,E;if(G){if(H===g||(typeof H==="string"&&H.charAt(0)==".")){for(var I in G){this.remove(K,I+(H||""))}}else{if(H.type){J=H.handler;H=H.type}o.each(H.split(/\s+/),function(M,O){var Q=O.split(".");O=Q.shift();var N=RegExp("(^|\\.)"+Q.slice().sort().join(".*\\.")+"(\\.|$)");if(G[O]){if(J){delete G[O][J.guid]}else{for(var P in G[O]){if(N.test(G[O][P].type)){delete G[O][P]}}}if(o.event.specialAll[O]){o.event.specialAll[O].teardown.call(K,Q)}for(F in G[O]){break}if(!F){if(!o.event.special[O]||o.event.special[O].teardown.call(K,Q)===false){if(K.removeEventListener){K.removeEventListener(O,o.data(K,"handle"),false)}else{if(K.detachEvent){K.detachEvent("on"+O,o.data(K,"handle"))}}}F=null;delete G[O]}}})}for(F in G){break}if(!F){var L=o.data(K,"handle");if(L){L.elem=null}o.removeData(K,"events");o.removeData(K,"handle")}}},trigger:function(I,K,H,E){var G=I.type||I;if(!E){I=typeof I==="object"?I[h]?I:o.extend(o.Event(G),I):o.Event(G);if(G.indexOf("!")>=0){I.type=G=G.slice(0,-1);I.exclusive=true}if(!H){I.stopPropagation();if(this.global[G]){o.each(o.cache,function(){if(this.events&&this.events[G]){o.event.trigger(I,K,this.handle.elem)}})}}if(!H||H.nodeType==3||H.nodeType==8){return g}I.result=g;I.target=H;K=o.makeArray(K);K.unshift(I)}I.currentTarget=H;var J=o.data(H,"handle");if(J){J.apply(H,K)}if((!H[G]||(o.nodeName(H,"a")&&G=="click"))&&H["on"+G]&&H["on"+G].apply(H,K)===false){I.result=false}if(!E&&H[G]&&!I.isDefaultPrevented()&&!(o.nodeName(H,"a")&&G=="click")){this.triggered=true;try{H[G]()}catch(L){}}this.triggered=false;if(!I.isPropagationStopped()){var F=H.parentNode||H.ownerDocument;if(F){o.event.trigger(I,K,F,true)}}},handle:function(K){var J,E;K=arguments[0]=o.event.fix(K||l.event);K.currentTarget=this;var L=K.type.split(".");K.type=L.shift();J=!L.length&&!K.exclusive;var I=RegExp("(^|\\.)"+L.slice().sort().join(".*\\.")+"(\\.|$)");E=(o.data(this,"events")||{})[K.type];for(var G in E){var H=E[G];if(J||I.test(H.type)){K.handler=H;K.data=H.data;var F=H.apply(this,arguments);if(F!==g){K.result=F;if(F===false){K.preventDefault();K.stopPropagation()}}if(K.isImmediatePropagationStopped()){break}}}},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(H){if(H[h]){return H}var F=H;H=o.Event(F);for(var G=this.props.length,J;G;){J=this.props[--G];H[J]=F[J]}if(!H.target){H.target=H.srcElement||document}if(H.target.nodeType==3){H.target=H.target.parentNode}if(!H.relatedTarget&&H.fromElement){H.relatedTarget=H.fromElement==H.target?H.toElement:H.fromElement}if(H.pageX==null&&H.clientX!=null){var I=document.documentElement,E=document.body;H.pageX=H.clientX+(I&&I.scrollLeft||E&&E.scrollLeft||0)-(I.clientLeft||0);H.pageY=H.clientY+(I&&I.scrollTop||E&&E.scrollTop||0)-(I.clientTop||0)}if(!H.which&&((H.charCode||H.charCode===0)?H.charCode:H.keyCode)){H.which=H.charCode||H.keyCode}if(!H.metaKey&&H.ctrlKey){H.metaKey=H.ctrlKey}if(!H.which&&H.button){H.which=(H.button&1?1:(H.button&2?3:(H.button&4?2:0)))}return H},proxy:function(F,E){E=E||function(){return F.apply(this,arguments)};E.guid=F.guid=F.guid||E.guid||this.guid++;return E},special:{ready:{setup:B,teardown:function(){}}},specialAll:{live:{setup:function(E,F){o.event.add(this,F[0],c)},teardown:function(G){if(G.length){var E=0,F=RegExp("(^|\\.)"+G[0]+"(\\.|$)");o.each((o.data(this,"events").live||{}),function(){if(F.test(this.type)){E++}});if(E<1){o.event.remove(this,G[0],c)}}}}}};o.Event=function(E){if(!this.preventDefault){return new o.Event(E)}if(E&&E.type){this.originalEvent=E;this.type=E.type}else{this.type=E}this.timeStamp=e();this[h]=true};function k(){return false}function u(){return true}o.Event.prototype={preventDefault:function(){this.isDefaultPrevented=u;var E=this.originalEvent;if(!E){return}if(E.preventDefault){E.preventDefault()}E.returnValue=false},stopPropagation:function(){this.isPropagationStopped=u;var E=this.originalEvent;if(!E){return}if(E.stopPropagation){E.stopPropagation()}E.cancelBubble=true},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=u;this.stopPropagation()},isDefaultPrevented:k,isPropagationStopped:k,isImmediatePropagationStopped:k};var a=function(F){var E=F.relatedTarget;while(E&&E!=this){try{E=E.parentNode}catch(G){E=this}}if(E!=this){F.type=F.data;o.event.handle.apply(this,arguments)}};o.each({mouseover:"mouseenter",mouseout:"mouseleave"},function(F,E){o.event.special[E]={setup:function(){o.event.add(this,F,a,E)},teardown:function(){o.event.remove(this,F,a)}}});o.fn.extend({bind:function(F,G,E){return F=="unload"?this.one(F,G,E):this.each(function(){o.event.add(this,F,E||G,E&&G)})},one:function(G,H,F){var E=o.event.proxy(F||H,function(I){o(this).unbind(I,E);return(F||H).apply(this,arguments)});return this.each(function(){o.event.add(this,G,E,F&&H)})},unbind:function(F,E){return this.each(function(){o.event.remove(this,F,E)})},trigger:function(E,F){return this.each(function(){o.event.trigger(E,F,this)})},triggerHandler:function(E,G){if(this[0]){var F=o.Event(E);F.preventDefault();F.stopPropagation();o.event.trigger(F,G,this[0]);return F.result}},toggle:function(G){var E=arguments,F=1;while(F<E.length){o.event.proxy(G,E[F++])}return this.click(o.event.proxy(G,function(H){this.lastToggle=(this.lastToggle||0)%F;H.preventDefault();return E[this.lastToggle++].apply(this,arguments)||false}))},hover:function(E,F){return this.mouseenter(E).mouseleave(F)},ready:function(E){B();if(o.isReady){E.call(document,o)}else{o.readyList.push(E)}return this},live:function(G,F){var E=o.event.proxy(F);E.guid+=this.selector+G;o(document).bind(i(G,this.selector),this.selector,E);return this},die:function(F,E){o(document).unbind(i(F,this.selector),E?{guid:E.guid+this.selector+F}:null);return this}});function c(H){var E=RegExp("(^|\\.)"+H.type+"(\\.|$)"),G=true,F=[];o.each(o.data(this,"events").live||[],function(I,J){if(E.test(J.type)){var K=o(H.target).closest(J.data)[0];if(K){F.push({elem:K,fn:J})}}});F.sort(function(J,I){return o.data(J.elem,"closest")-o.data(I.elem,"closest")});o.each(F,function(){if(this.fn.call(this.elem,H,this.fn.data)===false){return(G=false)}});return G}function i(F,E){return["live",F,E.replace(/\./g,"`").replace(/ /g,"|")].join(".")}o.extend({isReady:false,readyList:[],ready:function(){if(!o.isReady){o.isReady=true;if(o.readyList){o.each(o.readyList,function(){this.call(document,o)});o.readyList=null}o(document).triggerHandler("ready")}}});var x=false;function B(){if(x){return}x=true;if(document.addEventListener){document.addEventListener("DOMContentLoaded",function(){document.removeEventListener("DOMContentLoaded",arguments.callee,false);o.ready()},false)}else{if(document.attachEvent){document.attachEvent("onreadystatechange",function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",arguments.callee);o.ready()}});if(document.documentElement.doScroll&&l==l.top){(function(){if(o.isReady){return}try{document.documentElement.doScroll("left")}catch(E){setTimeout(arguments.callee,0);return}o.ready()})()}}}o.event.add(l,"load",o.ready)}o.each(("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,select,submit,keydown,keypress,keyup,error").split(","),function(F,E){o.fn[E]=function(G){return G?this.bind(E,G):this.trigger(E)}});o(l).bind("unload",function(){for(var E in o.cache){if(E!=1&&o.cache[E].handle){o.event.remove(o.cache[E].handle.elem)}}});(function(){o.support={};var F=document.documentElement,G=document.createElement("script"),K=document.createElement("div"),J="script"+(new Date).getTime();K.style.display="none";K.innerHTML='   <link/><table></table><a href="/a" style="color:red;float:left;opacity:.5;">a</a><select><option>text</option></select><object><param/></object>';var H=K.getElementsByTagName("*"),E=K.getElementsByTagName("a")[0];if(!H||!H.length||!E){return}o.support={leadingWhitespace:K.firstChild.nodeType==3,tbody:!K.getElementsByTagName("tbody").length,objectAll:!!K.getElementsByTagName("object")[0].getElementsByTagName("*").length,htmlSerialize:!!K.getElementsByTagName("link").length,style:/red/.test(E.getAttribute("style")),hrefNormalized:E.getAttribute("href")==="/a",opacity:E.style.opacity==="0.5",cssFloat:!!E.style.cssFloat,scriptEval:false,noCloneEvent:true,boxModel:null};G.type="text/javascript";try{G.appendChild(document.createTextNode("window."+J+"=1;"))}catch(I){}F.insertBefore(G,F.firstChild);if(l[J]){o.support.scriptEval=true;delete l[J]}F.removeChild(G);if(K.attachEvent&&K.fireEvent){K.attachEvent("onclick",function(){o.support.noCloneEvent=false;K.detachEvent("onclick",arguments.callee)});K.cloneNode(true).fireEvent("onclick")}o(function(){var L=document.createElement("div");L.style.width=L.style.paddingLeft="1px";document.body.appendChild(L);o.boxModel=o.support.boxModel=L.offsetWidth===2;document.body.removeChild(L).style.display="none"})})();var w=o.support.cssFloat?"cssFloat":"styleFloat";o.props={"for":"htmlFor","class":"className","float":w,cssFloat:w,styleFloat:w,readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",tabindex:"tabIndex"};o.fn.extend({_load:o.fn.load,load:function(G,J,K){if(typeof G!=="string"){return this._load(G)}var I=G.indexOf(" ");if(I>=0){var E=G.slice(I,G.length);G=G.slice(0,I)}var H="GET";if(J){if(o.isFunction(J)){K=J;J=null}else{if(typeof J==="object"){J=o.param(J);H="POST"}}}var F=this;o.ajax({url:G,type:H,dataType:"html",data:J,complete:function(M,L){if(L=="success"||L=="notmodified"){F.html(E?o("<div/>").append(M.responseText.replace(/<script(.|\s)*?\/script>/g,"")).find(E):M.responseText)}if(K){F.each(K,[M.responseText,L,M])}}});return this},serialize:function(){return o.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?o.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||/select|textarea/i.test(this.nodeName)||/text|hidden|password|search/i.test(this.type))}).map(function(E,F){var G=o(this).val();return G==null?null:o.isArray(G)?o.map(G,function(I,H){return{name:F.name,value:I}}):{name:F.name,value:G}}).get()}});o.each("ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","),function(E,F){o.fn[F]=function(G){return this.bind(F,G)}});var r=e();o.extend({get:function(E,G,H,F){if(o.isFunction(G)){H=G;G=null}return o.ajax({type:"GET",url:E,data:G,success:H,dataType:F})},getScript:function(E,F){return o.get(E,null,F,"script")},getJSON:function(E,F,G){return o.get(E,F,G,"json")},post:function(E,G,H,F){if(o.isFunction(G)){H=G;G={}}return o.ajax({type:"POST",url:E,data:G,success:H,dataType:F})},ajaxSetup:function(E){o.extend(o.ajaxSettings,E)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:function(){return l.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest()},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},ajax:function(M){M=o.extend(true,M,o.extend(true,{},o.ajaxSettings,M));var W,F=/=\?(&|$)/g,R,V,G=M.type.toUpperCase();if(M.data&&M.processData&&typeof M.data!=="string"){M.data=o.param(M.data)}if(M.dataType=="jsonp"){if(G=="GET"){if(!M.url.match(F)){M.url+=(M.url.match(/\?/)?"&":"?")+(M.jsonp||"callback")+"=?"}}else{if(!M.data||!M.data.match(F)){M.data=(M.data?M.data+"&":"")+(M.jsonp||"callback")+"=?"}}M.dataType="json"}if(M.dataType=="json"&&(M.data&&M.data.match(F)||M.url.match(F))){W="jsonp"+r++;if(M.data){M.data=(M.data+"").replace(F,"="+W+"$1")}M.url=M.url.replace(F,"="+W+"$1");M.dataType="script";l[W]=function(X){V=X;I();L();l[W]=g;try{delete l[W]}catch(Y){}if(H){H.removeChild(T)}}}if(M.dataType=="script"&&M.cache==null){M.cache=false}if(M.cache===false&&G=="GET"){var E=e();var U=M.url.replace(/(\?|&)_=.*?(&|$)/,"$1_="+E+"$2");M.url=U+((U==M.url)?(M.url.match(/\?/)?"&":"?")+"_="+E:"")}if(M.data&&G=="GET"){M.url+=(M.url.match(/\?/)?"&":"?")+M.data;M.data=null}if(M.global&&!o.active++){o.event.trigger("ajaxStart")}var Q=/^(\w+:)?\/\/([^\/?#]+)/.exec(M.url);if(M.dataType=="script"&&G=="GET"&&Q&&(Q[1]&&Q[1]!=location.protocol||Q[2]!=location.host)){var H=document.getElementsByTagName("head")[0];var T=document.createElement("script");T.src=M.url;if(M.scriptCharset){T.charset=M.scriptCharset}if(!W){var O=false;T.onload=T.onreadystatechange=function(){if(!O&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){O=true;I();L();T.onload=T.onreadystatechange=null;H.removeChild(T)}}}H.appendChild(T);return g}var K=false;var J=M.xhr();if(M.username){J.open(G,M.url,M.async,M.username,M.password)}else{J.open(G,M.url,M.async)}try{if(M.data){J.setRequestHeader("Content-Type",M.contentType)}if(M.ifModified){J.setRequestHeader("If-Modified-Since",o.lastModified[M.url]||"Thu, 01 Jan 1970 00:00:00 GMT")}J.setRequestHeader("X-Requested-With","XMLHttpRequest");J.setRequestHeader("Accept",M.dataType&&M.accepts[M.dataType]?M.accepts[M.dataType]+", */*":M.accepts._default)}catch(S){}if(M.beforeSend&&M.beforeSend(J,M)===false){if(M.global&&!--o.active){o.event.trigger("ajaxStop")}J.abort();return false}if(M.global){o.event.trigger("ajaxSend",[J,M])}var N=function(X){if(J.readyState==0){if(P){clearInterval(P);P=null;if(M.global&&!--o.active){o.event.trigger("ajaxStop")}}}else{if(!K&&J&&(J.readyState==4||X=="timeout")){K=true;if(P){clearInterval(P);P=null}R=X=="timeout"?"timeout":!o.httpSuccess(J)?"error":M.ifModified&&o.httpNotModified(J,M.url)?"notmodified":"success";if(R=="success"){try{V=o.httpData(J,M.dataType,M)}catch(Z){R="parsererror"}}if(R=="success"){var Y;try{Y=J.getResponseHeader("Last-Modified")}catch(Z){}if(M.ifModified&&Y){o.lastModified[M.url]=Y}if(!W){I()}}else{o.handleError(M,J,R)}L();if(X){J.abort()}if(M.async){J=null}}}};if(M.async){var P=setInterval(N,13);if(M.timeout>0){setTimeout(function(){if(J&&!K){N("timeout")}},M.timeout)}}try{J.send(M.data)}catch(S){o.handleError(M,J,null,S)}if(!M.async){N()}function I(){if(M.success){M.success(V,R)}if(M.global){o.event.trigger("ajaxSuccess",[J,M])}}function L(){if(M.complete){M.complete(J,R)}if(M.global){o.event.trigger("ajaxComplete",[J,M])}if(M.global&&!--o.active){o.event.trigger("ajaxStop")}}return J},handleError:function(F,H,E,G){if(F.error){F.error(H,E,G)}if(F.global){o.event.trigger("ajaxError",[H,F,G])}},active:0,httpSuccess:function(F){try{return !F.status&&location.protocol=="file:"||(F.status>=200&&F.status<300)||F.status==304||F.status==1223}catch(E){}return false},httpNotModified:function(G,E){try{var H=G.getResponseHeader("Last-Modified");return G.status==304||H==o.lastModified[E]}catch(F){}return false},httpData:function(J,H,G){var F=J.getResponseHeader("content-type"),E=H=="xml"||!H&&F&&F.indexOf("xml")>=0,I=E?J.responseXML:J.responseText;if(E&&I.documentElement.tagName=="parsererror"){throw"parsererror"}if(G&&G.dataFilter){I=G.dataFilter(I,H)}if(typeof I==="string"){if(H=="script"){o.globalEval(I)}if(H=="json"){I=l["eval"]("("+I+")")}}return I},param:function(E){var G=[];function H(I,J){G[G.length]=encodeURIComponent(I)+"="+encodeURIComponent(J)}if(o.isArray(E)||E.jquery){o.each(E,function(){H(this.name,this.value)})}else{for(var F in E){if(o.isArray(E[F])){o.each(E[F],function(){H(F,this)})}else{H(F,o.isFunction(E[F])?E[F]():E[F])}}}return G.join("&").replace(/%20/g,"+")}});var m={},n,d=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];function t(F,E){var G={};o.each(d.concat.apply([],d.slice(0,E)),function(){G[this]=F});return G}o.fn.extend({show:function(J,L){if(J){return this.animate(t("show",3),J,L)}else{for(var H=0,F=this.length;H<F;H++){var E=o.data(this[H],"olddisplay");this[H].style.display=E||"";if(o.css(this[H],"display")==="none"){var G=this[H].tagName,K;if(m[G]){K=m[G]}else{var I=o("<"+G+" />").appendTo("body");K=I.css("display");if(K==="none"){K="block"}I.remove();m[G]=K}o.data(this[H],"olddisplay",K)}}for(var H=0,F=this.length;H<F;H++){this[H].style.display=o.data(this[H],"olddisplay")||""}return this}},hide:function(H,I){if(H){return this.animate(t("hide",3),H,I)}else{for(var G=0,F=this.length;G<F;G++){var E=o.data(this[G],"olddisplay");if(!E&&E!=="none"){o.data(this[G],"olddisplay",o.css(this[G],"display"))}}for(var G=0,F=this.length;G<F;G++){this[G].style.display="none"}return this}},_toggle:o.fn.toggle,toggle:function(G,F){var E=typeof G==="boolean";return o.isFunction(G)&&o.isFunction(F)?this._toggle.apply(this,arguments):G==null||E?this.each(function(){var H=E?G:o(this).is(":hidden");o(this)[H?"show":"hide"]()}):this.animate(t("toggle",3),G,F)},fadeTo:function(E,G,F){return this.animate({opacity:G},E,F)},animate:function(I,F,H,G){var E=o.speed(F,H,G);return this[E.queue===false?"each":"queue"](function(){var K=o.extend({},E),M,L=this.nodeType==1&&o(this).is(":hidden"),J=this;for(M in I){if(I[M]=="hide"&&L||I[M]=="show"&&!L){return K.complete.call(this)}if((M=="height"||M=="width")&&this.style){K.display=o.css(this,"display");K.overflow=this.style.overflow}}if(K.overflow!=null){this.style.overflow="hidden"}K.curAnim=o.extend({},I);o.each(I,function(O,S){var R=new o.fx(J,K,O);if(/toggle|show|hide/.test(S)){R[S=="toggle"?L?"show":"hide":S](I)}else{var Q=S.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),T=R.cur(true)||0;if(Q){var N=parseFloat(Q[2]),P=Q[3]||"px";if(P!="px"){J.style[O]=(N||1)+P;T=((N||1)/R.cur(true))*T;J.style[O]=T+P}if(Q[1]){N=((Q[1]=="-="?-1:1)*N)+T}R.custom(T,N,P)}else{R.custom(T,S,"")}}});return true})},stop:function(F,E){var G=o.timers;if(F){this.queue([])}this.each(function(){for(var H=G.length-1;H>=0;H--){if(G[H].elem==this){if(E){G[H](true)}G.splice(H,1)}}});if(!E){this.dequeue()}return this}});o.each({slideDown:t("show",1),slideUp:t("hide",1),slideToggle:t("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(E,F){o.fn[E]=function(G,H){return this.animate(F,G,H)}});o.extend({speed:function(G,H,F){var E=typeof G==="object"?G:{complete:F||!F&&H||o.isFunction(G)&&G,duration:G,easing:F&&H||H&&!o.isFunction(H)&&H};E.duration=o.fx.off?0:typeof E.duration==="number"?E.duration:o.fx.speeds[E.duration]||o.fx.speeds._default;E.old=E.complete;E.complete=function(){if(E.queue!==false){o(this).dequeue()}if(o.isFunction(E.old)){E.old.call(this)}};return E},easing:{linear:function(G,H,E,F){return E+F*G},swing:function(G,H,E,F){return((-Math.cos(G*Math.PI)/2)+0.5)*F+E}},timers:[],fx:function(F,E,G){this.options=E;this.elem=F;this.prop=G;if(!E.orig){E.orig={}}}});o.fx.prototype={update:function(){if(this.options.step){this.options.step.call(this.elem,this.now,this)}(o.fx.step[this.prop]||o.fx.step._default)(this);if((this.prop=="height"||this.prop=="width")&&this.elem.style){this.elem.style.display="block"}},cur:function(F){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]}var E=parseFloat(o.css(this.elem,this.prop,F));return E&&E>-10000?E:parseFloat(o.curCSS(this.elem,this.prop))||0},custom:function(I,H,G){this.startTime=e();this.start=I;this.end=H;this.unit=G||this.unit||"px";this.now=this.start;this.pos=this.state=0;var E=this;function F(J){return E.step(J)}F.elem=this.elem;if(F()&&o.timers.push(F)&&!n){n=setInterval(function(){var K=o.timers;for(var J=0;J<K.length;J++){if(!K[J]()){K.splice(J--,1)}}if(!K.length){clearInterval(n);n=g}},13)}},show:function(){this.options.orig[this.prop]=o.attr(this.elem.style,this.prop);this.options.show=true;this.custom(this.prop=="width"||this.prop=="height"?1:0,this.cur());o(this.elem).show()},hide:function(){this.options.orig[this.prop]=o.attr(this.elem.style,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(H){var G=e();if(H||G>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;var E=true;for(var F in this.options.curAnim){if(this.options.curAnim[F]!==true){E=false}}if(E){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;this.elem.style.display=this.options.display;if(o.css(this.elem,"display")=="none"){this.elem.style.display="block"}}if(this.options.hide){o(this.elem).hide()}if(this.options.hide||this.options.show){for(var I in this.options.curAnim){o.attr(this.elem.style,I,this.options.orig[I])}}this.options.complete.call(this.elem)}return false}else{var J=G-this.startTime;this.state=J/this.options.duration;this.pos=o.easing[this.options.easing||(o.easing.swing?"swing":"linear")](this.state,J,0,1,this.options.duration);this.now=this.start+((this.end-this.start)*this.pos);this.update()}return true}};o.extend(o.fx,{speeds:{slow:600,fast:200,_default:400},step:{opacity:function(E){o.attr(E.elem.style,"opacity",E.now)},_default:function(E){if(E.elem.style&&E.elem.style[E.prop]!=null){E.elem.style[E.prop]=E.now+E.unit}else{E.elem[E.prop]=E.now}}}});if(document.documentElement.getBoundingClientRect){o.fn.offset=function(){if(!this[0]){return{top:0,left:0}}if(this[0]===this[0].ownerDocument.body){return o.offset.bodyOffset(this[0])}var G=this[0].getBoundingClientRect(),J=this[0].ownerDocument,F=J.body,E=J.documentElement,L=E.clientTop||F.clientTop||0,K=E.clientLeft||F.clientLeft||0,I=G.top+(self.pageYOffset||o.boxModel&&E.scrollTop||F.scrollTop)-L,H=G.left+(self.pageXOffset||o.boxModel&&E.scrollLeft||F.scrollLeft)-K;return{top:I,left:H}}}else{o.fn.offset=function(){if(!this[0]){return{top:0,left:0}}if(this[0]===this[0].ownerDocument.body){return o.offset.bodyOffset(this[0])}o.offset.initialized||o.offset.initialize();var J=this[0],G=J.offsetParent,F=J,O=J.ownerDocument,M,H=O.documentElement,K=O.body,L=O.defaultView,E=L.getComputedStyle(J,null),N=J.offsetTop,I=J.offsetLeft;while((J=J.parentNode)&&J!==K&&J!==H){M=L.getComputedStyle(J,null);N-=J.scrollTop,I-=J.scrollLeft;if(J===G){N+=J.offsetTop,I+=J.offsetLeft;if(o.offset.doesNotAddBorder&&!(o.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(J.tagName))){N+=parseInt(M.borderTopWidth,10)||0,I+=parseInt(M.borderLeftWidth,10)||0}F=G,G=J.offsetParent}if(o.offset.subtractsBorderForOverflowNotVisible&&M.overflow!=="visible"){N+=parseInt(M.borderTopWidth,10)||0,I+=parseInt(M.borderLeftWidth,10)||0}E=M}if(E.position==="relative"||E.position==="static"){N+=K.offsetTop,I+=K.offsetLeft}if(E.position==="fixed"){N+=Math.max(H.scrollTop,K.scrollTop),I+=Math.max(H.scrollLeft,K.scrollLeft)}return{top:N,left:I}}}o.offset={initialize:function(){if(this.initialized){return}var L=document.body,F=document.createElement("div"),H,G,N,I,M,E,J=L.style.marginTop,K='<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';M={position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"};for(E in M){F.style[E]=M[E]}F.innerHTML=K;L.insertBefore(F,L.firstChild);H=F.firstChild,G=H.firstChild,I=H.nextSibling.firstChild.firstChild;this.doesNotAddBorder=(G.offsetTop!==5);this.doesAddBorderForTableAndCells=(I.offsetTop===5);H.style.overflow="hidden",H.style.position="relative";this.subtractsBorderForOverflowNotVisible=(G.offsetTop===-5);L.style.marginTop="1px";this.doesNotIncludeMarginInBodyOffset=(L.offsetTop===0);L.style.marginTop=J;L.removeChild(F);this.initialized=true},bodyOffset:function(E){o.offset.initialized||o.offset.initialize();var G=E.offsetTop,F=E.offsetLeft;if(o.offset.doesNotIncludeMarginInBodyOffset){G+=parseInt(o.curCSS(E,"marginTop",true),10)||0,F+=parseInt(o.curCSS(E,"marginLeft",true),10)||0}return{top:G,left:F}}};o.fn.extend({position:function(){var I=0,H=0,F;if(this[0]){var G=this.offsetParent(),J=this.offset(),E=/^body|html$/i.test(G[0].tagName)?{top:0,left:0}:G.offset();J.top-=j(this,"marginTop");J.left-=j(this,"marginLeft");E.top+=j(G,"borderTopWidth");E.left+=j(G,"borderLeftWidth");F={top:J.top-E.top,left:J.left-E.left}}return F},offsetParent:function(){var E=this[0].offsetParent||document.body;while(E&&(!/^body|html$/i.test(E.tagName)&&o.css(E,"position")=="static")){E=E.offsetParent}return o(E)}});o.each(["Left","Top"],function(F,E){var G="scroll"+E;o.fn[G]=function(H){if(!this[0]){return null}return H!==g?this.each(function(){this==l||this==document?l.scrollTo(!F?H:o(l).scrollLeft(),F?H:o(l).scrollTop()):this[G]=H}):this[0]==l||this[0]==document?self[F?"pageYOffset":"pageXOffset"]||o.boxModel&&document.documentElement[G]||document.body[G]:this[0][G]}});o.each(["Height","Width"],function(I,G){var E=I?"Left":"Top",H=I?"Right":"Bottom",F=G.toLowerCase();o.fn["inner"+G]=function(){return this[0]?o.css(this[0],F,false,"padding"):null};o.fn["outer"+G]=function(K){return this[0]?o.css(this[0],F,false,K?"margin":"border"):null};var J=G.toLowerCase();o.fn[J]=function(K){return this[0]==l?document.compatMode=="CSS1Compat"&&document.documentElement["client"+G]||document.body["client"+G]:this[0]==document?Math.max(document.documentElement["client"+G],document.body["scroll"+G],document.documentElement["scroll"+G],document.body["offset"+G],document.documentElement["offset"+G]):K===g?(this.length?o.css(this[0],J):null):this.css(J,typeof K==="string"?K:K+"px")}})})();

/**
 * jQuery.ScrollTo - Easy element scrolling using jQuery.
 * Copyright (c) 2007-2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 9/11/2008
 * @author Ariel Flesler
 * @version 1.4
 *
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 */
;(function(h){var m=h.scrollTo=function(b,c,g){h(window).scrollTo(b,c,g)};m.defaults={axis:'y',duration:1};m.window=function(b){return h(window).scrollable()};h.fn.scrollable=function(){return this.map(function(){var b=this.parentWindow||this.defaultView,c=this.nodeName=='#document'?b.frameElement||b:this,g=c.contentDocument||(c.contentWindow||c).document,i=c.setInterval;return c.nodeName=='IFRAME'||i&&h.browser.safari?g.body:i?g.documentElement:this})};h.fn.scrollTo=function(r,j,a){if(typeof j=='object'){a=j;j=0}if(typeof a=='function')a={onAfter:a};a=h.extend({},m.defaults,a);j=j||a.speed||a.duration;a.queue=a.queue&&a.axis.length>1;if(a.queue)j/=2;a.offset=n(a.offset);a.over=n(a.over);return this.scrollable().each(function(){var k=this,o=h(k),d=r,l,e={},p=o.is('html,body');switch(typeof d){case'number':case'string':if(/^([+-]=)?\d+(px)?$/.test(d)){d=n(d);break}d=h(d,this);case'object':if(d.is||d.style)l=(d=h(d)).offset()}h.each(a.axis.split(''),function(b,c){var g=c=='x'?'Left':'Top',i=g.toLowerCase(),f='scroll'+g,s=k[f],t=c=='x'?'Width':'Height',v=t.toLowerCase();if(l){e[f]=l[i]+(p?0:s-o.offset()[i]);if(a.margin){e[f]-=parseInt(d.css('margin'+g))||0;e[f]-=parseInt(d.css('border'+g+'Width'))||0}e[f]+=a.offset[i]||0;if(a.over[i])e[f]+=d[v]()*a.over[i]}else e[f]=d[i];if(/^\d+$/.test(e[f]))e[f]=e[f]<=0?0:Math.min(e[f],u(t));if(!b&&a.queue){if(s!=e[f])q(a.onAfterFirst);delete e[f]}});q(a.onAfter);function q(b){o.animate(e,j,a.easing,b&&function(){b.call(this,r,a)})};function u(b){var c='scroll'+b,g=k.ownerDocument;return p?Math.max(g.documentElement[c],g.body[c]):k[c]}}).end()};function n(b){return typeof b=='object'?b:{top:b,left:b}}})(jQuery);

/*!
 * jQuery.SerialScroll
 * Copyright (c) 2007-2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 06/14/2009
 *
 * @projectDescription Animated scrolling of series.
 * @author Ariel Flesler
 * @version 1.2.2
 *
 * @id jQuery.serialScroll
 * @id jQuery.fn.serialScroll
 * @param {Object} settings Hash of settings, it is passed in to jQuery.ScrollTo, none is required.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @link {http://flesler.blogspot.com/2008/02/jqueryserialscroll.html Homepage}
 *
 * Notes:
 *	- The plugin requires jQuery.ScrollTo.
 *	- The hash of settings, is passed to jQuery.ScrollTo, so its settings can be used as well.
 */
;(function( $ ){

	var $serialScroll = $.serialScroll = function( settings ){
		return $(window).serialScroll( settings );
	};

	// Many of these defaults, belong to jQuery.ScrollTo, check it's demo for an example of each option.
	// @link {http://demos.flesler.com/jquery/scrollTo/ ScrollTo's Demo}
	$serialScroll.defaults = {// the defaults are public and can be overriden.
		duration:1000, // how long to animate.
		axis:'x', // which of top and left should be scrolled
		event:'click', // on which event to react.
		start:0, // first element (zero-based index)
		step:1, // how many elements to scroll on each action
		lock:true,// ignore events if already animating
		cycle:true, // cycle endlessly ( constant velocity )
		constant:true // use contant speed ?
		/*
		navigation:null,// if specified, it's a selector a collection of items to navigate the container
		target:window, // if specified, it's a selector to the element to be scrolled.
		interval:0, // it's the number of milliseconds to automatically go to the next
		lazy:false,// go find the elements each time (allows AJAX or JS content, or reordering)
		stop:false, // stop any previous animations to avoid queueing
		force:false,// force the scroll to the first element on start ?
		jump: false,// if true, when the event is triggered on an element, the pane scrolls to it
		items:null, // selector to the items (relative to the matched elements)
		prev:null, // selector to the 'prev' button
		next:null, // selector to the 'next' button
		onBefore: function(){}, // function called before scrolling, if it returns false, the event is ignored
		exclude:0 // exclude the last x elements, so we cannot scroll past the end
		*/
	};

	$.fn.serialScroll = function( options ){

		return this.each(function(){
			var 
				settings = $.extend( {}, $serialScroll.defaults, options ),
				event = settings.event, // this one is just to get shorter code when compressed
				step = settings.step, // ditto
				lazy = settings.lazy, // ditto
				context = settings.target ? this : document, // if a target is specified, then everything's relative to 'this'.
				$pane = $(settings.target || this, context),// the element to be scrolled (will carry all the events)
				pane = $pane[0], // will be reused, save it into a variable
				items = settings.items, // will hold a lazy list of elements
				active = settings.start, // active index
				auto = settings.interval, // boolean, do auto or not
				nav = settings.navigation, // save it now to make the code shorter
				timer, // holds the interval id
        navCounter = settings.navCounter; // navCounter for actual page

			if( !lazy )// if not lazy, save the items now
				items = getItems();

			if( settings.force )
				jump( {}, active );// generate an initial call

			// Button binding, optional
			$(settings.prev||[], context).bind( event, -step, move );
			$(settings.next||[], context).bind( event, step, move );

			// Custom events bound to the container
			if( !pane.ssbound )// don't bind more than once
				$pane
					.bind('prev.serialScroll', -step, move ) // you can trigger with just 'prev'
					.bind('next.serialScroll', step, move ) // f.e: $(container).trigger('next');
					.bind('goto.serialScroll', jump ); // f.e: $(container).trigger('goto', 4 );

			if( auto )
				$pane
					.bind('start.serialScroll', function(e){
						if( !auto ){
							clear();
							auto = true;
							next();
						}
					 })
					.bind('stop.serialScroll', function(){// stop a current animation
						clear();
						auto = false;
					});

			$pane.bind('notify.serialScroll', function(e, elem){// let serialScroll know that the index changed externally
				var i = index(elem);
				if( i > -1 )
					active = i;
			});

			pane.ssbound = true;// avoid many bindings

			if( settings.jump )// can't use jump if using lazy items and a non-bubbling event
				(lazy ? $pane : getItems()).bind( event, function( e ){
					jump( e, index(e.target) );
				});

			if( nav )
				nav = $(nav, context).bind(event, function( e ){
					e.data = Math.round(getItems().length / nav.length) * nav.index(this);
					jump( e, this );
				});

			function move( e ){
				e.data += active;
				jump( e, this );
			};
			function jump( e, button ){
				if( !isNaN(button) ){// initial or special call from the outside $(container).trigger('goto',[index]);
					e.data = button;
					button = pane;
				}

				var
					pos = e.data, n,
					real = e.type, // is a real event triggering ?
					$items = settings.exclude ? getItems().slice(0,-settings.exclude) : getItems(),// handle a possible exclude
					limit = $items.length,
					elem = $items[pos],
					duration = settings.duration;
					
				limit = Math.floor($items.length/step)*step;
				//alert(blabla);
				
				// set counter paging
				if(navCounter) {
				  max = Math.ceil($items.length/step);
				  navPage = (pos/step) + 1;
				  //alert(max);
          if(navPage > 0 && navPage <= max) $(navCounter||[], context).text(navPage);
          
          // hide prev
          if(navPage <= 1) $(settings.prev||[], context).hide();
          else $(settings.prev||[], context).show();
          
          // hide next
          if(navPage >= max) $(settings.next||[], context).hide();
          else $(settings.next||[], context).show();
        }

				if( real )// real event object
					e.preventDefault();

				if( auto ){
					clear();// clear any possible automatic scrolling.
					timer = setTimeout( next, settings.interval ); 
				}

				if( !elem ){ // exceeded the limits
					n = pos < 0 ? 0 : limit;
					if( active != n )// we exceeded for the first time
						pos = n;
					else if( !settings.cycle )// this is a bad case
						return;
					else
						pos = limit - n - 1;// invert, go to the other side
					elem = $items[pos];
				}

				if( !elem || settings.lock && $pane.is(':animated') || // no animations while busy
					real && settings.onBefore &&
					settings.onBefore(e, elem, $pane, getItems(), pos) === false ) return;

				if( settings.stop )
					$pane.queue('fx',[]).stop();// remove all its animations

				if( settings.constant )
					duration = Math.abs(duration/step * (active - pos ));// keep constant velocity

				$pane
					.scrollTo( elem, duration, settings )// do scroll
					.trigger('notify.serialScroll',[pos]);// in case serialScroll was called on this elem more than once.
			};

			function next(){// I'll use the namespace to avoid conflicts
				$pane.trigger('next.serialScroll');
			};

			function clear(){
				clearTimeout(timer);
			};

			function getItems(){
				return $( items, pane );
			};

			function index( elem ){
				if( !isNaN(elem) ) return elem;// number
				var $items = getItems(), i;
				while(( i = $items.index(elem)) == -1 && elem != pane )// see if it matches or one of its ancestors
					elem = elem.parentNode;
				return i;
			};
		});
	};

})( jQuery );

/*
 * Copyright (c) 2009 Simo Kinnunen.
 * Licensed under the MIT license.
 *
 * @version 1.06
 */
var Cufon=(function(){var m=function(){return m.replace.apply(null,arguments)};var x=m.DOM={ready:(function(){var C=false,E={loaded:1,complete:1};var B=[],D=function(){if(C){return}C=true;for(var F;F=B.shift();F()){}};if(document.addEventListener){document.addEventListener("DOMContentLoaded",D,false);window.addEventListener("pageshow",D,false)}if(!window.opera&&document.readyState){(function(){E[document.readyState]?D():setTimeout(arguments.callee,10)})()}if(document.readyState&&document.createStyleSheet){(function(){try{document.body.doScroll("left");D()}catch(F){setTimeout(arguments.callee,1)}})()}q(window,"load",D);return function(F){if(!arguments.length){D()}else{C?F():B.push(F)}}})(),root:function(){return document.documentElement||document.body}};var n=m.CSS={Size:function(C,B){this.value=parseFloat(C);this.unit=String(C).match(/[a-z%]*$/)[0]||"px";this.convert=function(D){return D/B*this.value};this.convertFrom=function(D){return D/this.value*B};this.toString=function(){return this.value+this.unit}},addClass:function(C,B){var D=C.className;C.className=D+(D&&" ")+B;return C},color:j(function(C){var B={};B.color=C.replace(/^rgba\((.*?),\s*([\d.]+)\)/,function(E,D,F){B.opacity=parseFloat(F);return"rgb("+D+")"});return B}),fontStretch:j(function(B){if(typeof B=="number"){return B}if(/%$/.test(B)){return parseFloat(B)/100}return{"ultra-condensed":0.5,"extra-condensed":0.625,condensed:0.75,"semi-condensed":0.875,"semi-expanded":1.125,expanded:1.25,"extra-expanded":1.5,"ultra-expanded":2}[B]||1}),getStyle:function(C){var B=document.defaultView;if(B&&B.getComputedStyle){return new a(B.getComputedStyle(C,null))}if(C.currentStyle){return new a(C.currentStyle)}return new a(C.style)},gradient:j(function(F){var G={id:F,type:F.match(/^-([a-z]+)-gradient\(/)[1],stops:[]},C=F.substr(F.indexOf("(")).match(/([\d.]+=)?(#[a-f0-9]+|[a-z]+\(.*?\)|[a-z]+)/ig);for(var E=0,B=C.length,D;E<B;++E){D=C[E].split("=",2).reverse();G.stops.push([D[1]||E/(B-1),D[0]])}return G}),quotedList:j(function(E){var D=[],C=/\s*((["'])([\s\S]*?[^\\])\2|[^,]+)\s*/g,B;while(B=C.exec(E)){D.push(B[3]||B[1])}return D}),recognizesMedia:j(function(G){var E=document.createElement("style"),D,C,B;E.type="text/css";E.media=G;try{E.appendChild(document.createTextNode("/**/"))}catch(F){}C=g("head")[0];C.insertBefore(E,C.firstChild);D=(E.sheet||E.styleSheet);B=D&&!D.disabled;C.removeChild(E);return B}),removeClass:function(D,C){var B=RegExp("(?:^|\\s+)"+C+"(?=\\s|$)","g");D.className=D.className.replace(B,"");return D},supports:function(D,C){var B=document.createElement("span").style;if(B[D]===undefined){return false}B[D]=C;return B[D]===C},textAlign:function(E,D,B,C){if(D.get("textAlign")=="right"){if(B>0){E=" "+E}}else{if(B<C-1){E+=" "}}return E},textShadow:j(function(F){if(F=="none"){return null}var E=[],G={},B,C=0;var D=/(#[a-f0-9]+|[a-z]+\(.*?\)|[a-z]+)|(-?[\d.]+[a-z%]*)|,/ig;while(B=D.exec(F)){if(B[0]==","){E.push(G);G={};C=0}else{if(B[1]){G.color=B[1]}else{G[["offX","offY","blur"][C++]]=B[2]}}}E.push(G);return E}),textTransform:(function(){var B={uppercase:function(C){return C.toUpperCase()},lowercase:function(C){return C.toLowerCase()},capitalize:function(C){return C.replace(/\b./g,function(D){return D.toUpperCase()})}};return function(E,D){var C=B[D.get("textTransform")];return C?C(E):E}})(),whiteSpace:(function(){var D={inline:1,"inline-block":1,"run-in":1};var C=/^\s+/,B=/\s+$/;return function(H,F,G,E){if(E){if(E.nodeName.toLowerCase()=="br"){H=H.replace(C,"")}}if(D[F.get("display")]){return H}if(!G.previousSibling){H=H.replace(C,"")}if(!G.nextSibling){H=H.replace(B,"")}return H}})()};n.ready=(function(){var B=!n.recognizesMedia("all"),E=false;var D=[],H=function(){B=true;for(var K;K=D.shift();K()){}};var I=g("link"),J=g("style");function C(K){return K.disabled||G(K.sheet,K.media||"screen")}function G(M,P){if(!n.recognizesMedia(P||"all")){return true}if(!M||M.disabled){return false}try{var Q=M.cssRules,O;if(Q){search:for(var L=0,K=Q.length;O=Q[L],L<K;++L){switch(O.type){case 2:break;case 3:if(!G(O.styleSheet,O.media.mediaText)){return false}break;default:break search}}}}catch(N){}return true}function F(){if(document.createStyleSheet){return true}var L,K;for(K=0;L=I[K];++K){if(L.rel.toLowerCase()=="stylesheet"&&!C(L)){return false}}for(K=0;L=J[K];++K){if(!C(L)){return false}}return true}x.ready(function(){if(!E){E=n.getStyle(document.body).isUsable()}if(B||(E&&F())){H()}else{setTimeout(arguments.callee,10)}});return function(K){if(B){K()}else{D.push(K)}}})();function s(D){var C=this.face=D.face,B={"\u0020":1,"\u00a0":1,"\u3000":1};this.glyphs=D.glyphs;this.w=D.w;this.baseSize=parseInt(C["units-per-em"],10);this.family=C["font-family"].toLowerCase();this.weight=C["font-weight"];this.style=C["font-style"]||"normal";this.viewBox=(function(){var F=C.bbox.split(/\s+/);var E={minX:parseInt(F[0],10),minY:parseInt(F[1],10),maxX:parseInt(F[2],10),maxY:parseInt(F[3],10)};E.width=E.maxX-E.minX;E.height=E.maxY-E.minY;E.toString=function(){return[this.minX,this.minY,this.width,this.height].join(" ")};return E})();this.ascent=-parseInt(C.ascent,10);this.descent=-parseInt(C.descent,10);this.height=-this.ascent+this.descent;this.spacing=function(L,N,E){var O=this.glyphs,M,K,G,P=[],F=0,J=-1,I=-1,H;while(H=L[++J]){M=O[H]||this.missingGlyph;if(!M){continue}if(K){F-=G=K[H]||0;P[I-1]-=G}F+=P[++I]=~~(M.w||this.w)+N+(B[H]?E:0);K=M.k}P.total=F;return P}}function f(){var C={},B={oblique:"italic",italic:"oblique"};this.add=function(D){(C[D.style]||(C[D.style]={}))[D.weight]=D};this.get=function(H,I){var G=C[H]||C[B[H]]||C.normal||C.italic||C.oblique;if(!G){return null}I={normal:400,bold:700}[I]||parseInt(I,10);if(G[I]){return G[I]}var E={1:1,99:0}[I%100],K=[],F,D;if(E===undefined){E=I>400}if(I==500){I=400}for(var J in G){if(!k(G,J)){continue}J=parseInt(J,10);if(!F||J<F){F=J}if(!D||J>D){D=J}K.push(J)}if(I<F){I=F}if(I>D){I=D}K.sort(function(M,L){return(E?(M>=I&&L>=I)?M<L:M>L:(M<=I&&L<=I)?M>L:M<L)?-1:1});return G[K[0]]}}function r(){function D(F,G){if(F.contains){return F.contains(G)}return F.compareDocumentPosition(G)&16}function B(G){var F=G.relatedTarget;if(!F||D(this,F)){return}C(this,G.type=="mouseover")}function E(F){C(this,F.type=="mouseenter")}function C(F,G){setTimeout(function(){var H=d.get(F).options;m.replace(F,G?h(H,H.hover):H,true)},10)}this.attach=function(F){if(F.onmouseenter===undefined){q(F,"mouseover",B);q(F,"mouseout",B)}else{q(F,"mouseenter",E);q(F,"mouseleave",E)}}}function u(){var C=[],D={};function B(H){var E=[],G;for(var F=0;G=H[F];++F){E[F]=C[D[G]]}return E}this.add=function(F,E){D[F]=C.push(E)-1};this.repeat=function(){var E=arguments.length?B(arguments):C,F;for(var G=0;F=E[G++];){m.replace(F[0],F[1],true)}}}function A(){var D={},B=0;function C(E){return E.cufid||(E.cufid=++B)}this.get=function(E){var F=C(E);return D[F]||(D[F]={})}}function a(B){var D={},C={};this.extend=function(E){for(var F in E){if(k(E,F)){D[F]=E[F]}}return this};this.get=function(E){return D[E]!=undefined?D[E]:B[E]};this.getSize=function(F,E){return C[F]||(C[F]=new n.Size(this.get(F),E))};this.isUsable=function(){return !!B}}function q(C,B,D){if(C.addEventListener){C.addEventListener(B,D,false)}else{if(C.attachEvent){C.attachEvent("on"+B,function(){return D.call(C,window.event)})}}}function v(C,B){var D=d.get(C);if(D.options){return C}if(B.hover&&B.hoverables[C.nodeName.toLowerCase()]){b.attach(C)}D.options=B;return C}function j(B){var C={};return function(D){if(!k(C,D)){C[D]=B.apply(null,arguments)}return C[D]}}function c(F,E){var B=n.quotedList(E.get("fontFamily").toLowerCase()),D;for(var C=0;D=B[C];++C){if(i[D]){return i[D].get(E.get("fontStyle"),E.get("fontWeight"))}}return null}function g(B){return document.getElementsByTagName(B)}function k(C,B){return C.hasOwnProperty(B)}function h(){var C={},B,F;for(var E=0,D=arguments.length;B=arguments[E],E<D;++E){for(F in B){if(k(B,F)){C[F]=B[F]}}}return C}function o(E,M,C,N,F,D){var K=document.createDocumentFragment(),H;if(M===""){return K}var L=N.separate;var I=M.split(p[L]),B=(L=="words");if(B&&t){if(/^\s/.test(M)){I.unshift("")}if(/\s$/.test(M)){I.push("")}}for(var J=0,G=I.length;J<G;++J){H=z[N.engine](E,B?n.textAlign(I[J],C,J,G):I[J],C,N,F,D,J<G-1);if(H){K.appendChild(H)}}return K}function l(D,M){var C=D.nodeName.toLowerCase();if(M.ignore[C]){return}var E=!M.textless[C];var B=n.getStyle(v(D,M)).extend(M);var F=c(D,B),G,K,I,H,L,J;if(!F){return}for(G=D.firstChild;G;G=I){K=G.nodeType;I=G.nextSibling;if(E&&K==3){if(H){H.appendData(G.data);D.removeChild(G)}else{H=G}if(I){continue}}if(H){D.replaceChild(o(F,n.whiteSpace(H.data,B,H,J),B,M,G,D),H);H=null}if(K==1){if(G.firstChild){if(G.nodeName.toLowerCase()=="cufon"){z[M.engine](F,null,B,M,G,D)}else{arguments.callee(G,M)}}J=G}}}var t=" ".split(/\s+/).length==0;var d=new A();var b=new r();var y=new u();var e=false;var z={},i={},w={autoDetect:false,engine:null,forceHitArea:false,hover:false,hoverables:{a:true},ignore:{applet:1,canvas:1,col:1,colgroup:1,head:1,iframe:1,map:1,optgroup:1,option:1,script:1,select:1,style:1,textarea:1,title:1,pre:1},printable:true,selector:(window.Sizzle||(window.jQuery&&function(B){return jQuery(B)})||(window.dojo&&dojo.query)||(window.Ext&&Ext.query)||(window.YAHOO&&YAHOO.util&&YAHOO.util.Selector&&YAHOO.util.Selector.query)||(window.$$&&function(B){return $$(B)})||(window.$&&function(B){return $(B)})||(document.querySelectorAll&&function(B){return document.querySelectorAll(B)})||g),separate:"words",textless:{dl:1,html:1,ol:1,table:1,tbody:1,thead:1,tfoot:1,tr:1,ul:1},textShadow:"none"};var p={words:/\s/.test("\u00a0")?/[^\S\u00a0]+/:/\s+/,characters:"",none:/^/};m.now=function(){x.ready();return m};m.refresh=function(){y.repeat.apply(y,arguments);return m};m.registerEngine=function(C,B){if(!B){return m}z[C]=B;return m.set("engine",C)};m.registerFont=function(D){if(!D){return m}var B=new s(D),C=B.family;if(!i[C]){i[C]=new f()}i[C].add(B);return m.set("fontFamily",'"'+C+'"')};m.replace=function(D,C,B){C=h(w,C);if(!C.engine){return m}if(!e){n.addClass(x.root(),"cufon-active cufon-loading");n.ready(function(){n.addClass(n.removeClass(x.root(),"cufon-loading"),"cufon-ready")});e=true}if(C.hover){C.forceHitArea=true}if(C.autoDetect){delete C.fontFamily}if(typeof C.textShadow=="string"){C.textShadow=n.textShadow(C.textShadow)}if(typeof C.color=="string"&&/^-/.test(C.color)){C.textGradient=n.gradient(C.color)}else{delete C.textGradient}if(!B){y.add(D,arguments)}if(D.nodeType||typeof D=="string"){D=[D]}n.ready(function(){for(var F=0,E=D.length;F<E;++F){var G=D[F];if(typeof G=="string"){m.replace(C.selector(G),C,true)}else{l(G,C)}}});return m};m.set=function(B,C){w[B]=C;return m};return m})();Cufon.registerEngine("canvas",(function(){var b=document.createElement("canvas");if(!b||!b.getContext||!b.getContext.apply){return}b=null;var a=Cufon.CSS.supports("display","inline-block");var e=!a&&(document.compatMode=="BackCompat"||/frameset|transitional/i.test(document.doctype.publicId));var f=document.createElement("style");f.type="text/css";f.appendChild(document.createTextNode(("cufon{text-indent:0;}@media screen,projection{cufon{display:inline;display:inline-block;position:relative;vertical-align:middle;"+(e?"":"font-size:1px;line-height:1px;")+"}cufon cufontext{display:-moz-inline-box;display:inline-block;width:0;height:0;overflow:hidden;text-indent:-10000in;}"+(a?"cufon canvas{position:relative;}":"cufon canvas{position:absolute;}")+"}@media print{cufon{padding:0;}cufon canvas{display:none;}}").replace(/;/g,"!important;")));document.getElementsByTagName("head")[0].appendChild(f);function d(p,h){var n=0,m=0;var g=[],o=/([mrvxe])([^a-z]*)/g,k;generate:for(var j=0;k=o.exec(p);++j){var l=k[2].split(",");switch(k[1]){case"v":g[j]={m:"bezierCurveTo",a:[n+~~l[0],m+~~l[1],n+~~l[2],m+~~l[3],n+=~~l[4],m+=~~l[5]]};break;case"r":g[j]={m:"lineTo",a:[n+=~~l[0],m+=~~l[1]]};break;case"m":g[j]={m:"moveTo",a:[n=~~l[0],m=~~l[1]]};break;case"x":g[j]={m:"closePath"};break;case"e":break generate}h[g[j].m].apply(h,g[j].a)}return g}function c(m,k){for(var j=0,h=m.length;j<h;++j){var g=m[j];k[g.m].apply(k,g.a)}}return function(V,w,P,t,C,W){var k=(w===null);if(k){w=C.alt}var A=V.viewBox;var m=P.getSize("fontSize",V.baseSize);var B=0,O=0,N=0,u=0;var z=t.textShadow,L=[];if(z){for(var U=z.length;U--;){var F=z[U];var K=m.convertFrom(parseFloat(F.offX));var I=m.convertFrom(parseFloat(F.offY));L[U]=[K,I];if(I<B){B=I}if(K>O){O=K}if(I>N){N=I}if(K<u){u=K}}}var Z=Cufon.CSS.textTransform(w,P).split("");var E=V.spacing(Z,~~m.convertFrom(parseFloat(P.get("letterSpacing"))||0),~~m.convertFrom(parseFloat(P.get("wordSpacing"))||0));if(!E.length){return null}var h=E.total;O+=A.width-E[E.length-1];u+=A.minX;var s,n;if(k){s=C;n=C.firstChild}else{s=document.createElement("cufon");s.className="cufon cufon-canvas";s.alt=w;n=document.createElement("canvas");s.appendChild(n);if(t.printable){var S=document.createElement("cufontext");S.appendChild(document.createTextNode(w));s.appendChild(S)}}var aa=s.style;var H=n.style;var j=m.convert(A.height);var Y=Math.ceil(j);var M=Y/j;var G=M*Cufon.CSS.fontStretch(P.get("fontStretch"));var J=h*G;var Q=Math.ceil(m.convert(J+O-u));var o=Math.ceil(m.convert(A.height-B+N));n.width=Q;n.height=o;H.width=Q+"px";H.height=o+"px";B+=A.minY;H.top=Math.round(m.convert(B-V.ascent))+"px";H.left=Math.round(m.convert(u))+"px";var r=Math.max(Math.ceil(m.convert(J)),0)+"px";if(a){aa.width=r;aa.height=m.convert(V.height)+"px"}else{aa.paddingLeft=r;aa.paddingBottom=(m.convert(V.height)-1)+"px"}var X=n.getContext("2d"),D=j/A.height;X.scale(D,D*M);X.translate(-u,-B);X.save();function T(){var x=V.glyphs,ab,l=-1,g=-1,y;X.scale(G,1);while(y=Z[++l]){var ab=x[Z[l]]||V.missingGlyph;if(!ab){continue}if(ab.d){X.beginPath();if(ab.code){c(ab.code,X)}else{ab.code=d("m"+ab.d,X)}X.fill()}X.translate(E[++g],0)}X.restore()}if(z){for(var U=z.length;U--;){var F=z[U];X.save();X.fillStyle=F.color;X.translate.apply(X,L[U]);T()}}var q=t.textGradient;if(q){var v=q.stops,p=X.createLinearGradient(0,A.minY,0,A.maxY);for(var U=0,R=v.length;U<R;++U){p.addColorStop.apply(p,v[U])}X.fillStyle=p}else{X.fillStyle=P.get("color")}T();return s}})());Cufon.registerEngine("vml",(function(){var e=document.namespaces;if(!e){return}e.add("cvml","urn:schemas-microsoft-com:vml");e=null;var b=document.createElement("cvml:shape");b.style.behavior="url(#default#VML)";if(!b.coordsize){return}b=null;var h=(document.documentMode||0)<8;document.write(('<style type="text/css">cufoncanvas{text-indent:0;}@media screen{cvml\\:shape,cvml\\:rect,cvml\\:fill,cvml\\:shadow{behavior:url(#default#VML);display:block;antialias:true;position:absolute;}cufoncanvas{position:absolute;text-align:left;}cufon{display:inline-block;position:relative;vertical-align:'+(h?"middle":"text-bottom")+";}cufon cufontext{position:absolute;left:-10000in;font-size:1px;}a cufon{cursor:pointer}}@media print{cufon cufoncanvas{display:none;}}</style>").replace(/;/g,"!important;"));function c(i,j){return a(i,/(?:em|ex|%)$|^[a-z-]+$/i.test(j)?"1em":j)}function a(l,m){if(m==="0"){return 0}if(/px$/i.test(m)){return parseFloat(m)}var k=l.style.left,j=l.runtimeStyle.left;l.runtimeStyle.left=l.currentStyle.left;l.style.left=m.replace("%","em");var i=l.style.pixelLeft;l.style.left=k;l.runtimeStyle.left=j;return i}function f(l,k,j,n){var i="computed"+n,m=k[i];if(isNaN(m)){m=k.get(n);k[i]=m=(m=="normal")?0:~~j.convertFrom(a(l,m))}return m}var g={};function d(p){var q=p.id;if(!g[q]){var n=p.stops,o=document.createElement("cvml:fill"),i=[];o.type="gradient";o.angle=180;o.focus="0";o.method="sigma";o.color=n[0][1];for(var m=1,l=n.length-1;m<l;++m){i.push(n[m][0]*100+"% "+n[m][1])}o.colors=i.join(",");o.color2=n[l][1];g[q]=o}return g[q]}return function(ac,G,Y,C,K,ad,W){var n=(G===null);if(n){G=K.alt}var I=ac.viewBox;var p=Y.computedFontSize||(Y.computedFontSize=new Cufon.CSS.Size(c(ad,Y.get("fontSize"))+"px",ac.baseSize));var y,q;if(n){y=K;q=K.firstChild}else{y=document.createElement("cufon");y.className="cufon cufon-vml";y.alt=G;q=document.createElement("cufoncanvas");y.appendChild(q);if(C.printable){var Z=document.createElement("cufontext");Z.appendChild(document.createTextNode(G));y.appendChild(Z)}if(!W){y.appendChild(document.createElement("cvml:shape"))}}var ai=y.style;var R=q.style;var l=p.convert(I.height),af=Math.ceil(l);var V=af/l;var P=V*Cufon.CSS.fontStretch(Y.get("fontStretch"));var U=I.minX,T=I.minY;R.height=af;R.top=Math.round(p.convert(T-ac.ascent));R.left=Math.round(p.convert(U));ai.height=p.convert(ac.height)+"px";var F=Y.get("color");var ag=Cufon.CSS.textTransform(G,Y).split("");var L=ac.spacing(ag,f(ad,Y,p,"letterSpacing"),f(ad,Y,p,"wordSpacing"));if(!L.length){return null}var k=L.total;var x=-U+k+(I.width-L[L.length-1]);var ah=p.convert(x*P),X=Math.round(ah);var O=x+","+I.height,m;var J="r"+O+"ns";var u=C.textGradient&&d(C.textGradient);var o=ac.glyphs,S=0;var H=C.textShadow;var ab=-1,aa=0,w;while(w=ag[++ab]){var D=o[ag[ab]]||ac.missingGlyph,v;if(!D){continue}if(n){v=q.childNodes[aa];while(v.firstChild){v.removeChild(v.firstChild)}}else{v=document.createElement("cvml:shape");q.appendChild(v)}v.stroked="f";v.coordsize=O;v.coordorigin=m=(U-S)+","+T;v.path=(D.d?"m"+D.d+"xe":"")+"m"+m+J;v.fillcolor=F;if(u){v.appendChild(u.cloneNode(false))}var ae=v.style;ae.width=X;ae.height=af;if(H){var s=H[0],r=H[1];var B=Cufon.CSS.color(s.color),z;var N=document.createElement("cvml:shadow");N.on="t";N.color=B.color;N.offset=s.offX+","+s.offY;if(r){z=Cufon.CSS.color(r.color);N.type="double";N.color2=z.color;N.offset2=r.offX+","+r.offY}N.opacity=B.opacity||(z&&z.opacity)||1;v.appendChild(N)}S+=L[aa++]}var M=v.nextSibling,t,A;if(C.forceHitArea){if(!M){M=document.createElement("cvml:rect");M.stroked="f";M.className="cufon-vml-cover";t=document.createElement("cvml:fill");t.opacity=0;M.appendChild(t);q.appendChild(M)}A=M.style;A.width=X;A.height=af}else{if(M){q.removeChild(M)}}ai.width=Math.max(Math.ceil(p.convert(k*P)),0);if(h){var Q=Y.computedYAdjust;if(Q===undefined){var E=Y.get("lineHeight");if(E=="normal"){E="1em"}else{if(!isNaN(E)){E+="em"}}Y.computedYAdjust=Q=0.5*(a(ad,E)-parseFloat(ai.height))}if(Q){ai.marginTop=Math.ceil(Q)+"px";ai.marginBottom=Q+"px"}}return y}})());

/*!
 * The following copyright notice may not be removed under any circumstances.
 * 
 * Copyright:
 * © 2008 The Monotype Corporation. All Rights Reserved.
 * 
 * Trademark:
 * Arial is a trademark of The Monotype Corporation in the United States and/or
 * other countries.
 * 
 * Manufacturer:
 * The Monotype Corporation
 * 
 * Designer:
 * Monotype Type Drawing Office - Robin Nicholas, Patricia Saunders 1982
 */
Cufon.registerFont({"w":200,"face":{"font-family":"arial","font-weight":400,"font-stretch":"normal","units-per-em":"360","panose-1":"2 11 6 4 2 2 2 2 2 4","ascent":"288","descent":"-72","x-height":"4","bbox":"-17 -323 352 76.2176","underline-thickness":"26.3672","underline-position":"-24.9609","unicode-range":"U+0020-U+017E"},"glyphs":{" ":{"w":100,"k":{"Y":7,"T":7,"A":20}},"\u00a0":{"w":100},"!":{"d":"41,-64r-10,-137r0,-57r39,0v1,69,-5,130,-9,194r-20,0xm32,0r0,-36r37,0r0,36r-37,0","w":100},"\"":{"d":"25,-166v-5,-28,-10,-57,-8,-92r36,0v2,35,-3,64,-8,92r-20,0xm83,-166v-5,-28,-10,-57,-8,-92r36,0v2,35,-3,64,-9,92r-19,0","w":127},"#":{"d":"18,4r15,-74r-29,0r0,-27r35,0r13,-63r-48,0r0,-27r53,0r15,-75r27,0r-16,75r56,0r15,-75r27,0r-16,75r31,0r0,27r-36,0r-13,63r49,0r0,27r-54,0r-16,74r-26,0r15,-74r-55,0r-16,74r-26,0xm65,-97r55,0r13,-63r-55,0"},"$":{"d":"183,-73v2,43,-32,78,-75,78r0,32r-18,0r0,-32v-49,-4,-73,-29,-77,-77r32,-6v3,33,19,53,45,57r0,-101v-35,-7,-74,-27,-72,-72v1,-41,27,-69,72,-72r0,-15r18,0r0,15v40,4,64,26,69,63r-33,5v-3,-24,-15,-37,-36,-42r0,92v48,10,72,26,75,75xm90,-240v-32,2,-52,44,-31,70v6,7,17,14,31,18r0,-88xm108,-21v34,-1,56,-49,34,-78v-6,-7,-17,-13,-34,-19r0,97"},"%":{"d":"75,-126v-37,0,-55,-29,-54,-70v0,-34,18,-66,54,-66v35,0,56,29,56,68v0,39,-22,67,-56,68xm104,-195v0,-27,-7,-45,-28,-45v-22,0,-27,18,-27,47v0,28,6,45,27,45v22,0,28,-18,28,-47xm76,9r141,-271r26,0r-141,271r-26,0xm242,9v-36,0,-54,-29,-54,-69v0,-37,18,-67,54,-67v34,1,56,29,56,68v0,39,-21,68,-56,68xm270,-60v0,-27,-6,-45,-27,-45v-22,0,-28,19,-28,48v0,26,7,45,28,45v22,0,27,-19,27,-48","w":320},"&":{"d":"112,-262v34,0,60,24,60,55v0,24,-17,46,-49,63r46,59v5,-10,10,-22,13,-36r32,7v-6,22,-12,40,-22,55v12,16,25,29,40,40r-21,25v-13,-8,-26,-20,-40,-36v-18,20,-40,33,-74,34v-45,2,-83,-33,-82,-75v1,-40,29,-60,62,-77v-18,-21,-27,-30,-29,-57v-2,-32,30,-57,64,-57xm110,-236v-30,0,-39,38,-17,55r14,16v21,-13,29,-18,32,-41v1,-17,-13,-30,-29,-30xm50,-73v-2,35,40,65,77,41v10,-6,18,-14,24,-23r-58,-72v-26,16,-41,26,-43,54","w":240},"'":{"d":"24,-166v-5,-28,-10,-57,-8,-92r36,0v2,35,-3,64,-9,92r-19,0","w":68},"(":{"d":"107,-262v-66,97,-72,231,0,338r-23,0v-31,-40,-62,-101,-62,-169v1,-74,27,-121,62,-169r23,0","w":119},")":{"d":"107,-93v1,68,-32,129,-63,169r-22,0v71,-107,66,-242,0,-338r22,0v35,49,62,96,63,169","w":119},"*":{"d":"11,-210r8,-25v19,7,33,12,41,17v-2,-21,-4,-36,-4,-44r26,0v0,12,-2,27,-4,44v12,-6,25,-12,41,-17r8,25v-15,5,-29,7,-43,9v7,6,17,18,30,34r-21,15v-7,-9,-15,-22,-24,-38v-9,17,-16,29,-23,38r-21,-15v14,-17,23,-29,29,-34v-15,-3,-29,-5,-43,-9","w":140},"+":{"d":"90,-42r0,-70r-70,0r0,-30r70,0r0,-70r30,0r0,70r70,0r0,30r-70,0r0,70r-30,0","w":210},",":{"d":"32,0r0,-36r36,0v1,40,2,77,-29,87r-9,-14v15,-6,20,-16,20,-37r-18,0","w":100},"-":{"d":"11,-77r0,-32r98,0r0,32r-98,0","w":119},"\u00ad":{"d":"11,-77r0,-32r98,0r0,32r-98,0","w":119},".":{"d":"33,0r0,-36r36,0r0,36r-36,0","w":100},"\/":{"d":"0,4r75,-266r25,0r-75,266r-25,0","w":100},"0":{"d":"99,4v-67,0,-84,-54,-84,-131v0,-75,16,-132,84,-132v67,0,84,56,84,132v0,74,-16,131,-84,131xm99,-233v-46,6,-52,44,-52,106v0,65,8,98,52,105v44,-6,51,-40,51,-105v0,-65,-6,-99,-51,-106"},"1":{"d":"39,-194v32,-13,61,-39,75,-65r20,0r0,259r-32,0r0,-202v-14,14,-43,31,-63,39r0,-31","k":{"1":27}},"2":{"d":"181,-187v0,78,-96,103,-126,157r126,0r0,30r-170,0v6,-90,131,-106,137,-188v2,-26,-21,-46,-48,-45v-31,0,-51,20,-51,52r-32,-3v3,-47,35,-75,84,-75v46,0,80,30,80,72"},"3":{"d":"136,-140v88,26,42,150,-39,145v-45,-3,-78,-32,-82,-73r32,-4v6,31,18,50,50,50v30,1,54,-23,53,-53v0,-37,-34,-60,-72,-47r3,-28v28,4,58,-12,58,-42v0,-23,-19,-41,-42,-41v-28,0,-43,20,-47,47r-32,-6v7,-38,36,-64,78,-67v71,-6,103,95,40,119"},"4":{"d":"116,0r0,-62r-111,0r0,-29r117,-167r26,0r0,167r35,0r0,29r-35,0r0,62r-32,0xm116,-91r0,-116r-80,116r80,0"},"5":{"d":"186,-87v0,102,-163,129,-171,19r33,-2v3,29,21,48,50,48v31,0,54,-28,54,-63v0,-60,-78,-75,-102,-33r-29,-4r25,-132r128,0r0,30r-103,0r-14,69v54,-41,129,2,129,68"},"6":{"d":"14,-121v0,-103,66,-171,142,-121v14,9,20,27,23,47r-31,3v-4,-35,-42,-53,-70,-32v-23,18,-33,45,-33,91v13,-20,34,-34,63,-34v43,-1,77,38,76,83v-2,50,-31,88,-81,88v-63,0,-89,-47,-89,-125xm101,-139v-29,0,-52,24,-51,56v1,33,19,61,52,61v29,0,49,-26,49,-60v0,-33,-19,-57,-50,-57"},"7":{"d":"53,0v4,-86,46,-174,90,-224r-126,0r0,-30r167,0r0,24v-47,54,-92,133,-98,230r-33,0"},"8":{"d":"15,-75v1,-36,19,-57,49,-65v-71,-23,-35,-126,35,-119v70,-9,105,99,37,119v29,9,47,30,48,66v1,46,-38,78,-85,78v-48,0,-85,-33,-84,-79xm99,-233v-23,0,-42,18,-42,40v0,24,18,41,43,41v23,0,41,-18,41,-40v0,-23,-19,-41,-42,-41xm99,-126v-29,0,-53,23,-52,52v2,30,22,52,53,52v29,1,52,-22,52,-51v0,-30,-23,-53,-53,-53"},"9":{"d":"184,-134v0,81,-20,135,-92,138v-42,2,-68,-26,-72,-64r30,-2v5,25,16,40,43,40v49,0,58,-49,60,-99v-11,18,-35,34,-62,34v-43,0,-76,-38,-76,-85v0,-49,34,-90,81,-87v64,4,88,47,88,125xm99,-115v31,-1,50,-24,50,-58v0,-33,-19,-60,-49,-60v-30,1,-53,29,-53,62v0,31,22,56,52,56"},":":{"d":"33,-151r0,-36r36,0r0,36r-36,0xm33,0r0,-36r36,0r0,36r-36,0","w":100},";":{"d":"32,-151r0,-36r36,0r0,36r-36,0xm32,0r0,-36r36,0v1,40,2,77,-29,87r-9,-14v15,-6,20,-16,20,-37r-18,0","w":100},"\u037e":{"d":"32,-151r0,-36r36,0r0,36r-36,0xm32,0r0,-36r36,0v1,40,2,77,-29,87r-9,-14v15,-6,20,-16,20,-37r-18,0","w":100},"<":{"d":"20,-113r0,-29r170,-72r0,31r-135,56r135,56r0,31","w":210},"=":{"d":"190,-152r-170,0r0,-29r170,0r0,29xm190,-73r-170,0r0,-30r170,0r0,30","w":210},">":{"d":"190,-113r-170,73r0,-31r135,-56r-135,-56r0,-31r170,72r0,29","w":210},"?":{"d":"182,-192v0,61,-74,60,-69,129r-30,0v-10,-71,61,-75,67,-127v3,-24,-25,-47,-50,-46v-31,2,-47,20,-52,52r-32,-4v6,-45,33,-74,83,-74v46,0,83,28,83,70xm81,0r0,-36r36,0r0,36r-36,0"},"@":{"d":"238,1v-22,0,-33,-7,-34,-30v-13,16,-30,30,-54,30v-108,0,-62,-192,28,-192v25,0,42,14,53,33r6,-27r31,0r-30,145v0,7,5,11,12,11v38,-8,68,-51,68,-97v0,-70,-56,-111,-126,-111v-89,0,-145,64,-146,152v-1,91,61,134,151,135v57,0,101,-22,124,-53r31,0v-26,46,-78,80,-155,79v-107,-1,-177,-53,-177,-158v0,-107,64,-180,174,-180v88,0,146,52,150,137v3,58,-51,127,-106,126xm180,-164v-61,-1,-88,129,-23,139v41,-6,61,-45,64,-89v1,-28,-16,-50,-41,-50","w":365},"A":{"d":"-1,0r99,-258r37,0r106,258r-39,0r-30,-78r-108,0r-28,78r-37,0xm74,-106r87,0r-45,-125v-9,45,-28,84,-42,125","w":240,"k":{"y":7,"w":7,"v":7,"Y":27,"W":13,"V":27,"T":27," ":20}},"B":{"d":"221,-75v1,89,-104,75,-195,75r0,-258v82,0,182,-14,182,66v0,27,-15,46,-36,55v29,8,48,29,49,62xm175,-188v0,-52,-64,-37,-115,-39r0,78v50,-2,115,12,115,-39xm186,-75v0,-55,-70,-43,-126,-44r0,89v56,-2,126,12,126,-45","w":240},"C":{"d":"136,-25v43,0,68,-26,76,-65r34,8v-12,51,-48,86,-107,86v-84,1,-113,-57,-121,-135v-14,-136,189,-182,223,-56r-33,8v-11,-33,-29,-53,-69,-54v-60,-1,-86,44,-86,102v0,61,25,106,83,106","w":259},"D":{"d":"241,-130v0,82,-35,130,-120,130r-93,0r0,-258r89,0v89,-3,124,46,124,128xm206,-131v0,-64,-21,-99,-90,-96r-54,0r0,197r55,0v68,2,89,-37,89,-101","w":259},"E":{"d":"28,0r0,-258r187,0r0,31r-152,0r0,79r142,0r0,30r-142,0r0,88r158,0r0,30r-193,0","w":240},"F":{"d":"30,0r0,-258r173,0r0,31r-139,0r0,80r121,0r0,30r-121,0r0,117r-34,0","w":219,"k":{"A":20,".":40,",":40}},"G":{"d":"54,-130v-8,101,111,128,170,77r0,-48r-76,0r0,-30r110,0r0,95v-29,22,-61,40,-107,40v-80,0,-127,-52,-132,-132v-8,-116,138,-177,215,-100v10,10,16,25,20,42r-31,9v-9,-35,-33,-55,-75,-56v-64,0,-89,42,-94,103","w":280},"H":{"d":"29,0r0,-258r34,0r0,106r134,0r0,-106r34,0r0,258r-34,0r0,-121r-134,0r0,121r-34,0","w":259},"I":{"d":"34,0r0,-258r34,0r0,258r-34,0","w":100},"J":{"d":"152,-82v13,80,-77,109,-124,67v-13,-12,-18,-32,-18,-58r31,-4v1,34,9,51,38,51v31,0,39,-19,39,-54r0,-178r34,0r0,176","w":180},"K":{"d":"26,0r0,-258r34,0r0,128r128,-128r47,0r-108,105r112,153r-45,0r-91,-130r-43,41r0,89r-34,0","w":240},"L":{"d":"26,0r0,-258r34,0r0,228r127,0r0,30r-161,0","k":{"y":13,"Y":27,"W":27,"V":27,"T":27," ":13}},"M":{"d":"27,0r0,-258r51,0r73,221r76,-221r46,0r0,258r-33,0r0,-216r-75,216r-31,0r-74,-219r0,219r-33,0","w":299},"N":{"d":"27,0r0,-258r35,0r136,203r0,-203r32,0r0,258r-35,0r-135,-202r0,202r-33,0","w":259},"O":{"d":"141,4v-77,0,-122,-55,-124,-130v-2,-80,49,-136,124,-136v78,0,123,54,123,134v0,78,-48,132,-123,132xm141,-233v-57,0,-88,40,-88,108v0,57,35,100,87,100v55,0,90,-43,89,-104v-1,-60,-30,-104,-88,-104","w":280},"P":{"d":"224,-183v0,78,-78,83,-162,78r0,105r-34,0r0,-258v90,1,196,-17,196,75xm189,-182v0,-59,-69,-43,-127,-45r0,92v57,-1,127,12,127,-47","w":240,"k":{"A":27,".":46,",":46," ":7}},"Q":{"d":"262,-129v0,45,-14,77,-39,101v16,11,31,19,44,24r-10,24v-19,-7,-38,-18,-56,-32v-89,47,-191,-16,-186,-117v4,-77,45,-133,124,-133v77,0,123,53,123,133xm51,-129v0,75,53,122,122,97v-11,-7,-21,-11,-33,-14r8,-25v20,6,36,13,49,24v55,-50,34,-192,-58,-186v-55,3,-88,41,-88,104","w":280},"R":{"d":"234,-187v-1,42,-29,66,-72,70v46,24,63,76,93,117r-42,0v-30,-37,-46,-92,-92,-113v-15,-2,-41,-1,-59,-1r0,114r-34,0r0,-258v90,3,209,-22,206,71xm199,-187v0,-56,-81,-40,-137,-42r0,85v57,-2,136,14,137,-43","w":259,"k":{"Y":7,"W":7,"V":7,"T":7}},"S":{"d":"177,-136v81,33,37,140,-51,140v-65,0,-107,-28,-110,-87r32,-3v4,41,33,55,76,60v56,6,90,-59,34,-80v-45,-17,-132,-19,-132,-85v0,-83,139,-91,175,-35v8,12,12,26,13,41r-33,2v5,-62,-119,-67,-122,-10v-2,44,93,40,118,57","w":240},"T":{"d":"93,0r0,-227r-85,0r0,-31r205,0r0,31r-86,0r0,227r-34,0","w":219,"k":{"y":20,"w":20,"u":13,"s":40,"r":13,"o":40,"i":13,"e":40,"c":40,"a":40,"O":7,"A":27,";":40,":":40,".":40,"-":20,",":40," ":7}},"U":{"d":"127,-26v108,0,60,-141,70,-232r34,0r0,149v1,76,-28,113,-101,113v-74,0,-102,-37,-102,-113r0,-149r34,0v9,90,-34,232,65,232","w":259},"V":{"d":"101,0r-99,-258r36,0r81,230r83,-230r35,0r-101,258r-35,0","w":240,"k":{"y":13,"u":13,"r":13,"o":20,"i":7,"e":20,"a":27,"A":27,";":13,":":13,".":33,"-":20,",":33}},"W":{"d":"73,0r-69,-258r35,0r50,222r61,-222r41,0r37,131v9,32,16,63,20,91r53,-222r35,0r-71,258r-33,0r-62,-227r-62,227r-35,0","w":339,"k":{"y":3,"u":7,"r":7,"o":7,"e":7,"a":13,"A":13,";":7,":":7,".":20,"-":7,",":20}},"X":{"d":"2,0r99,-134r-88,-124r41,0r67,98r73,-98r37,0r-91,122r98,136r-42,0r-76,-109r-77,109r-41,0","w":240},"Y":{"d":"100,0r0,-109r-99,-149r42,0r77,122r78,-122r39,0r-103,149r0,109r-34,0","w":240,"k":{"v":20,"u":20,"q":33,"p":27,"o":33,"i":13,"e":33,"a":27,"A":27,";":23,":":20,".":46,"-":33,",":46," ":7}},"Z":{"d":"7,0r0,-32r132,-165v9,-12,19,-21,27,-30r-144,0r0,-31r185,0r0,31r-161,197r165,0r0,30r-204,0","w":219},"[":{"d":"24,72r0,-330r70,0r0,26r-38,0r0,277r38,0r0,27r-70,0","w":100},"\\":{"d":"75,4r-75,-266r25,0r75,266r-25,0","w":100},"]":{"d":"77,72r-70,0r0,-27r38,0r0,-277r-38,0r0,-26r70,0r0,330","w":100},"^":{"d":"42,-121r-33,0r63,-141r25,0r62,141r-31,0r-44,-105","w":168},"_":{"d":"-5,72r0,-23r209,0r0,23r-209,0"},"`":{"d":"82,-210r-26,0r-40,-49r42,0","w":119},"a":{"d":"175,-120v0,46,-6,99,10,120r-33,0v-3,-7,-5,-14,-6,-23v-33,39,-133,39,-133,-26v0,-63,86,-56,130,-69v3,-35,-13,-47,-45,-47v-32,0,-42,10,-49,36r-31,-4v8,-41,37,-58,85,-58v50,0,72,16,72,71xm84,-21v42,-2,63,-23,59,-73v-23,15,-97,3,-96,44v0,18,15,31,37,29"},"b":{"d":"185,-96v10,81,-84,134,-132,73r0,23r-29,0r0,-258r31,0r0,92v47,-57,140,-8,130,70xm104,-165v-33,0,-51,31,-51,70v0,44,15,73,49,73v33,0,51,-31,51,-72v0,-41,-16,-71,-49,-71"},"c":{"d":"47,-94v-15,78,93,98,99,26r31,4v-5,40,-35,68,-78,68v-54,0,-87,-39,-85,-97v-17,-102,139,-138,160,-39r-31,5v-6,-23,-18,-38,-43,-38v-37,0,-54,28,-53,71","w":180},"d":{"d":"91,-191v24,0,41,12,52,26r0,-93r31,0r0,258r-29,0r0,-24v-12,19,-29,28,-52,28v-53,-2,-81,-43,-81,-97v0,-55,26,-96,79,-98xm94,-165v-34,0,-49,29,-49,72v0,41,18,71,51,71v32,0,49,-29,49,-69v0,-44,-16,-74,-51,-74"},"e":{"d":"102,-22v28,0,41,-15,50,-38r32,4v-9,36,-37,60,-82,60v-56,1,-89,-38,-89,-96v0,-59,32,-99,87,-99v55,0,90,42,85,106r-139,0v2,37,21,63,56,63xm152,-111v2,-50,-57,-70,-88,-39v-10,10,-15,23,-16,39r104,0"},"f":{"d":"108,-231v-33,-9,-51,6,-45,44r36,0r0,25r-36,0r0,162r-32,0r0,-162r-28,0r0,-25r28,0v-7,-60,24,-85,81,-72","w":100,"k":{"f":7}},"g":{"d":"176,-25v13,94,-74,121,-138,86v-15,-8,-20,-26,-20,-46r31,5v-1,35,56,37,77,21v18,-14,19,-25,18,-65v-14,16,-31,24,-52,24v-51,2,-80,-45,-80,-94v1,-55,25,-96,80,-97v22,0,41,9,55,27r0,-23r29,0r0,162xm95,-165v-33,0,-51,29,-51,68v0,42,16,71,51,71v35,0,52,-28,52,-70v0,-39,-20,-69,-52,-69"},"h":{"d":"105,-164v-69,0,-47,96,-50,164r-31,0r0,-258r31,0r0,93v38,-46,121,-31,121,47r0,118r-32,0v-8,-60,25,-164,-39,-164"},"i":{"d":"24,-221r0,-37r32,0r0,37r-32,0xm24,0r0,-187r32,0r0,187r-32,0","w":79},"j":{"d":"24,-221r0,-37r31,0r0,37r-31,0xm55,10v4,55,-26,74,-72,62r6,-26v28,7,35,-3,35,-37r0,-196r31,0r0,197","w":79},"k":{"d":"24,0r0,-258r32,0r0,147r74,-76r41,0r-71,70r79,117r-39,0r-62,-95r-22,21r0,74r-32,0","w":180},"l":{"d":"23,0r0,-258r32,0r0,258r-32,0","w":79},"m":{"d":"102,-163v-67,0,-42,97,-47,163r-31,0r0,-187r28,0r0,27v15,-38,98,-44,109,2v28,-52,116,-43,116,30r0,128r-32,0r0,-118v1,-31,-8,-44,-33,-45v-67,-2,-41,99,-46,163r-31,0r0,-121v-1,-26,-7,-42,-33,-42","w":299},"n":{"d":"105,-163v-69,-3,-46,97,-50,163r-31,0r0,-187r28,0r0,27v33,-53,123,-40,123,45r0,115r-31,0v-8,-59,25,-161,-39,-163"},"o":{"d":"99,4v-55,0,-87,-38,-87,-97v0,-59,32,-97,87,-98v54,0,88,39,88,95v0,64,-30,100,-88,100xm99,-165v-37,0,-55,30,-55,72v0,42,19,71,55,71v37,0,55,-29,55,-72v0,-42,-18,-71,-55,-71"},"p":{"d":"186,-95v8,78,-84,130,-131,76r0,91r-31,0r0,-259r29,0r0,25v12,-17,27,-29,54,-29v54,1,74,43,79,96xm104,-166v-32,0,-52,34,-52,74v0,41,17,70,50,70v34,0,51,-31,51,-73v0,-41,-16,-71,-49,-71"},"q":{"d":"13,-95v-11,-82,88,-129,133,-67r0,-25r28,0r0,259r-31,0r0,-92v-45,55,-141,3,-130,-75xm94,-166v-32,0,-49,31,-49,72v0,41,18,72,52,72v31,0,49,-30,49,-69v0,-42,-18,-75,-52,-75"},"r":{"d":"114,-151v-36,-23,-59,12,-59,53r0,98r-32,0r0,-187r29,0r0,29v13,-32,41,-42,73,-23","w":119,"k":{".":20,",":20}},"s":{"d":"138,-99v56,31,18,103,-47,103v-48,0,-73,-19,-80,-60r31,-5v-2,47,89,53,92,9v-16,-47,-118,-16,-118,-85v0,-61,103,-69,132,-30v5,7,9,16,11,28r-31,5v2,-39,-81,-42,-81,-7v0,32,70,31,91,42","w":180},"t":{"d":"61,-53v-2,25,10,28,32,25r4,28v-45,6,-67,0,-67,-55r0,-107r-24,0r0,-25r24,0r0,-46r31,-19r0,65r32,0r0,25r-32,0r0,109","w":100},"u":{"d":"93,-23v70,2,46,-96,50,-164r31,0r0,187r-28,0r0,-27v-34,53,-123,38,-123,-44r0,-116r32,0v8,60,-25,163,38,164"},"v":{"d":"76,0r-71,-187r33,0r52,150r53,-150r33,0r-71,187r-29,0","w":180,"k":{".":27,",":27}},"w":{"d":"58,0r-57,-187r33,0r41,148v8,-38,28,-107,39,-148r32,0r38,144r42,-144r31,0r-58,187r-33,0r-37,-144r-38,144r-33,0","w":259,"k":{".":20,",":20}},"x":{"d":"3,0r68,-97r-63,-90r39,0r42,65v15,-24,30,-42,46,-65r37,0r-64,88r69,99r-38,0r-49,-74r-49,74r-38,0","w":180},"y":{"d":"22,72r-3,-30v38,11,50,-10,58,-42r-71,-187r34,0r39,108v5,14,9,29,13,44v14,-54,35,-101,53,-152r32,0r-89,233v-12,23,-35,37,-66,26","w":180,"k":{".":27,",":27}},"z":{"d":"7,0r0,-26r119,-136r-112,1r0,-26r153,0r0,21r-121,140r126,-1r0,27r-165,0","w":180},"{":{"d":"46,-9v0,-44,-1,-66,-36,-70r0,-29v34,-3,37,-25,36,-67v-2,-63,6,-89,66,-87r0,28v-30,-1,-37,4,-36,36v0,67,1,84,-37,105v29,13,36,33,37,79v1,48,-6,61,36,62r0,28v-59,3,-67,-25,-66,-85","w":120},"|":{"d":"33,76r0,-338r28,0r0,338r-28,0","w":93},"}":{"d":"74,-178v0,44,1,66,36,70r0,29v-34,3,-37,26,-36,68v1,63,-6,89,-66,87r0,-28v30,1,37,-4,36,-36v0,-64,1,-86,37,-105v-29,-15,-37,-32,-37,-79v0,-48,7,-62,-36,-62r0,-28v58,-3,67,25,66,84","w":120},"~":{"d":"61,-122v-23,0,-30,10,-46,24r0,-36v34,-42,92,-8,135,3v19,0,35,-14,45,-25r0,38v-14,12,-26,19,-49,20v-28,1,-59,-24,-85,-24","w":210},"\u00c9":{"d":"99,-274r23,-49r42,0r-39,49r-26,0xm28,0r0,-258r187,0r0,31r-152,0r0,79r142,0r0,30r-142,0r0,88r158,0r0,30r-193,0","w":240},"\u00e1":{"d":"81,-210r24,-49r41,0r-38,49r-27,0xm175,-120v0,46,-6,99,10,120r-33,0v-3,-7,-5,-14,-6,-23v-33,39,-133,39,-133,-26v0,-63,86,-56,130,-69v3,-35,-13,-47,-45,-47v-32,0,-42,10,-49,36r-31,-4v8,-41,37,-58,85,-58v50,0,72,16,72,71xm84,-21v42,-2,63,-23,59,-73v-23,15,-97,3,-96,44v0,18,15,31,37,29"},"\u00e9":{"d":"82,-210r23,-49r42,0r-39,49r-26,0xm102,-22v28,0,41,-15,50,-38r32,4v-9,36,-37,60,-82,60v-56,1,-89,-38,-89,-96v0,-59,32,-99,87,-99v55,0,90,42,85,106r-139,0v2,37,21,63,56,63xm152,-111v2,-50,-57,-70,-88,-39v-10,10,-15,23,-16,39r104,0"},"\u00ed":{"d":"35,0r0,-187r31,0r0,187r-31,0xm33,-210r24,-49r41,0r-39,49r-26,0","w":100},"\u00f3":{"d":"82,-210r23,-49r42,0r-39,49r-26,0xm99,4v-55,0,-87,-38,-87,-97v0,-59,32,-97,87,-98v54,0,88,39,88,95v0,64,-30,100,-88,100xm99,-165v-37,0,-55,30,-55,72v0,42,19,71,55,71v37,0,55,-29,55,-72v0,-42,-18,-71,-55,-71"},"\u00fa":{"d":"80,-210r23,-49r41,0r-38,49r-26,0xm93,-23v70,2,46,-96,50,-164r31,0r0,187r-28,0r0,-27v-34,53,-123,38,-123,-44r0,-116r32,0v8,60,-25,163,38,164"},"\u00c1":{"d":"95,-274r23,-49r42,0r-39,49r-26,0xm-1,0r99,-258r37,0r106,258r-39,0r-30,-78r-108,0r-28,78r-37,0xm74,-106r87,0r-45,-125v-9,45,-28,84,-42,125","w":240},"\u00cd":{"d":"25,-274r23,-49r42,0r-39,49r-26,0xm34,0r0,-258r34,0r0,258r-34,0","w":100},"\u00d3":{"d":"119,-274r23,-49r42,0r-39,49r-26,0xm141,4v-77,0,-122,-55,-124,-130v-2,-80,49,-136,124,-136v78,0,123,54,123,134v0,78,-48,132,-123,132xm141,-233v-57,0,-88,40,-88,108v0,57,35,100,87,100v55,0,90,-43,89,-104v-1,-60,-30,-104,-88,-104","w":280},"\u00da":{"d":"108,-274r23,-49r42,0r-39,49r-26,0xm127,-26v108,0,60,-141,70,-232r34,0r0,149v1,76,-28,113,-101,113v-74,0,-102,-37,-102,-113r0,-149r34,0v9,90,-34,232,65,232","w":259},"\u0160":{"d":"115,-292r19,-30r36,0r-39,50r-34,0r-38,-50r36,0xm177,-136v81,33,37,140,-51,140v-65,0,-107,-28,-110,-87r32,-3v4,41,33,55,76,60v56,6,90,-59,34,-80v-45,-17,-132,-19,-132,-85v0,-83,139,-91,175,-35v8,12,12,26,13,41r-33,2v5,-62,-119,-67,-122,-10v-2,44,93,40,118,57","w":240},"\u0161":{"d":"89,-229r19,-30r36,0r-39,49r-34,0r-38,-49r36,0xm138,-99v56,31,18,103,-47,103v-48,0,-73,-19,-80,-60r31,-5v-2,47,89,53,92,9v-16,-47,-118,-16,-118,-85v0,-61,103,-69,132,-30v5,7,9,16,11,28r-31,5v2,-39,-81,-42,-81,-7v0,32,70,31,91,42","w":180},"\u017d":{"d":"112,-292r19,-30r36,0r-40,50r-33,0r-38,-50r36,0xm7,0r0,-32r132,-165v9,-12,19,-21,27,-30r-144,0r0,-31r185,0r0,31r-161,197r165,0r0,30r-204,0","w":219},"\u017e":{"d":"95,-229r20,-30r36,0r-40,49r-34,0r-38,-49r37,0xm7,0r0,-26r119,-136r-112,1r0,-26r153,0r0,21r-121,140r126,-1r0,27r-165,0","w":180},"\u00dd":{"d":"98,-274r23,-49r41,0r-38,49r-26,0xm100,0r0,-109r-99,-149r42,0r77,122r78,-122r39,0r-103,149r0,109r-34,0","w":240},"\u00fd":{"d":"74,-210r23,-49r42,0r-39,49r-26,0xm22,72r-3,-30v38,11,50,-10,58,-42r-71,-187r34,0r39,108v5,14,9,29,13,44v14,-54,35,-101,53,-152r32,0r-89,233v-12,23,-35,37,-66,26","w":180},"\u010c":{"d":"139,-292r19,-30r36,0r-39,50r-34,0r-38,-50r36,0xm136,-25v43,0,68,-26,76,-65r34,8v-12,51,-48,86,-107,86v-84,1,-113,-57,-121,-135v-14,-136,189,-182,223,-56r-33,8v-11,-33,-29,-53,-69,-54v-60,-1,-86,44,-86,102v0,61,25,106,83,106","w":259},"\u010d":{"d":"99,-229r19,-30r36,0r-40,49r-33,0r-38,-49r36,0xm47,-94v-15,78,93,98,99,26r31,4v-5,40,-35,68,-78,68v-54,0,-87,-39,-85,-97v-17,-102,139,-138,160,-39r-31,5v-6,-23,-18,-38,-43,-38v-37,0,-54,28,-53,71","w":180},"\u010e":{"d":"105,-292r20,-30r36,0r-40,50r-34,0r-38,-50r37,0xm241,-130v0,82,-35,130,-120,130r-93,0r0,-258r89,0v89,-3,124,46,124,128xm206,-131v0,-64,-21,-99,-90,-96r-54,0r0,197r55,0v68,2,89,-37,89,-101","w":259},"\u010f":{"d":"189,-225r0,-33r33,0v1,37,2,70,-27,79r-7,-12v12,-7,17,-14,17,-34r-16,0xm91,-191v24,0,41,12,52,26r0,-93r31,0r0,258r-29,0r0,-24v-12,19,-29,28,-52,28v-53,-2,-81,-43,-81,-97v0,-55,26,-96,79,-98xm94,-165v-34,0,-49,29,-49,72v0,41,18,71,51,71v33,0,50,-29,50,-69v0,-44,-17,-74,-52,-74","w":221},"\u011a":{"d":"117,-292r19,-30r36,0r-39,50r-34,0r-38,-50r36,0xm28,0r0,-258r187,0r0,31r-152,0r0,79r142,0r0,30r-142,0r0,88r158,0r0,30r-193,0","w":240},"\u011b":{"d":"102,-229r20,-30r36,0r-40,49r-34,0r-38,-49r37,0xm102,-22v28,0,41,-15,50,-38r32,4v-9,36,-37,60,-82,60v-56,1,-89,-38,-89,-96v0,-59,32,-99,87,-99v55,0,90,42,85,106r-139,0v2,37,21,63,56,63xm152,-111v2,-50,-57,-70,-88,-39v-10,10,-15,23,-16,39r104,0"},"\u0147":{"d":"129,-293r19,-30r36,0r-39,49r-34,0r-38,-49r36,0xm27,0r0,-258r35,0r136,203r0,-203r32,0r0,258r-35,0r-135,-202r0,202r-33,0","w":259},"\u0148":{"d":"103,-229r19,-30r36,0r-40,49r-33,0r-38,-49r36,0xm105,-163v-69,-3,-46,97,-50,163r-31,0r0,-187r28,0r0,27v33,-53,123,-40,123,45r0,115r-31,0v-8,-59,25,-161,-39,-163"},"\u0158":{"d":"114,-292r19,-30r36,0r-39,50r-34,0r-38,-50r36,0xm234,-187v-1,42,-29,66,-72,70v46,24,63,76,93,117r-42,0v-30,-37,-46,-92,-92,-113v-15,-2,-41,-1,-59,-1r0,114r-34,0r0,-258v90,3,209,-22,206,71xm199,-187v0,-56,-81,-40,-137,-42r0,85v57,-2,136,14,137,-43","w":259},"\u0159":{"d":"67,-229r19,-30r36,0r-40,49r-33,0r-38,-49r36,0xm114,-151v-36,-23,-59,12,-59,53r0,98r-32,0r0,-187r29,0r0,29v13,-32,41,-42,73,-23","w":119},"\u0164":{"d":"111,-292r19,-30r36,0r-40,50r-33,0r-38,-50r36,0xm93,0r0,-227r-85,0r0,-31r205,0r0,31r-86,0r0,227r-34,0","w":219},"\u0165":{"d":"102,-225r0,-33r32,0v1,36,2,70,-26,79r-8,-12v12,-7,18,-15,18,-34r-16,0xm61,-53v-3,26,10,28,32,25r4,28v-46,6,-68,-1,-68,-55r0,-107r-23,0r0,-25r23,0r0,-46r32,-19r0,65r32,0r0,25r-32,0r0,109","w":135},"\u016e":{"d":"130,-258v-18,0,-32,-15,-32,-33v0,-17,14,-32,31,-32v18,0,32,15,32,33v0,17,-14,32,-31,32xm130,-310v-9,0,-19,10,-19,19v0,11,9,20,19,20v9,1,19,-10,18,-20v1,-10,-9,-19,-18,-19xm127,-26v108,0,60,-141,70,-232r34,0r0,149v1,76,-28,113,-101,113v-74,0,-102,-37,-102,-113r0,-149r34,0v9,90,-34,232,65,232","w":259},"\u016f":{"d":"99,-202v-18,0,-32,-15,-32,-33v0,-17,15,-31,32,-32v17,0,31,15,31,33v0,17,-14,32,-31,32xm99,-254v-9,0,-19,9,-18,19v-1,11,8,19,18,19v10,0,19,-10,19,-19v0,-9,-10,-19,-19,-19xm93,-23v70,2,46,-96,50,-164r31,0r0,187r-28,0r0,-27v-34,53,-123,38,-123,-44r0,-116r32,0v8,60,-25,163,38,164"}}});
/*!
 * The following copyright notice may not be removed under any circumstances.
 * 
 * Copyright:
 * © 2008 The Monotype Corporation. All Rights Reserved.
 * 
 * Trademark:
 * Arial is a trademark of The Monotype Corporation in the United States and/or
 * other countries.
 * 
 * Manufacturer:
 * The Monotype Corporation
 * 
 * Designer:
 * Monotype Type Drawing Office - Robin Nicholas, Patricia Saunders 1982
 */
Cufon.registerFont({"w":200,"face":{"font-family":"arial","font-weight":700,"font-stretch":"normal","units-per-em":"360","panose-1":"2 11 7 4 2 2 2 2 2 4","ascent":"288","descent":"-72","x-height":"4","bbox":"-17 -331 350 76.147","underline-thickness":"37.793","underline-position":"-19.3359","unicode-range":"U+0020-U+017E"},"glyphs":{" ":{"w":100,"k":{"Y":7,"A":13}},"\u00a0":{"w":100},"!":{"d":"45,-66v-5,-63,-15,-121,-13,-192r54,0v2,71,-7,129,-13,192r-28,0xm34,0r0,-49r50,0r0,49r-50,0","w":119},"\"":{"d":"29,-166v-6,-28,-11,-56,-9,-92r53,0v2,35,-2,64,-8,92r-36,0xm108,-166v-6,-28,-11,-56,-9,-92r54,0v2,35,-2,64,-8,92r-37,0","w":170},"#":{"d":"27,-64r-24,0r0,-39r32,0r10,-52r-42,0r0,-39r50,0r14,-68r40,0r-14,68r38,0r14,-68r41,0r-14,68r24,0r0,39r-32,0r-11,52r43,0r0,39r-51,0r-14,68r-39,0r14,-68r-39,0r-14,68r-40,0xm85,-155r-10,52r39,0r10,-52r-39,0"},"$":{"d":"184,-77v1,44,-31,76,-73,80r0,33r-25,0r0,-32v-42,-5,-67,-34,-74,-76r46,-5v4,17,15,33,28,39r0,-74v-40,-12,-67,-33,-67,-78v0,-39,30,-68,67,-71r0,-17r25,0r0,17v38,5,60,25,66,61r-44,6v-3,-14,-11,-23,-22,-28r0,69v48,14,72,26,73,76xm86,-223v-29,6,-30,54,0,61r0,-61xm111,-36v24,-2,40,-34,23,-55v-5,-6,-12,-10,-23,-13r0,68"},"%":{"d":"73,-126v-39,0,-57,-25,-57,-68v0,-42,18,-68,56,-68v39,0,57,25,57,68v0,42,-18,68,-56,68xm72,-234v-17,1,-18,16,-18,40v0,24,2,36,18,40v26,0,26,-82,0,-80xm110,10r-37,0r137,-272r36,0xm247,10v-40,0,-58,-26,-58,-68v0,-42,18,-68,57,-68v39,0,57,25,57,68v0,42,-17,68,-56,68xm246,-98v-17,2,-18,16,-18,40v0,24,1,37,18,40v17,-2,18,-16,18,-40v0,-24,-1,-37,-18,-40","w":320},"&":{"d":"214,-61v8,8,31,25,40,30r-30,38v-15,-7,-29,-17,-42,-30v-44,49,-172,32,-166,-48v2,-41,27,-62,59,-79v-15,-16,-27,-32,-27,-56v0,-35,31,-56,72,-56v40,0,71,23,71,59v0,33,-18,41,-47,61r36,47v4,-8,8,-17,11,-29r45,10v-7,26,-11,37,-22,53xm121,-227v-41,2,-19,42,-1,55v10,-8,28,-20,28,-32v0,-14,-12,-24,-27,-23xm100,-118v-39,12,-49,83,5,82v21,-1,32,-9,46,-20","w":259},"'":{"d":"25,-166v-6,-28,-11,-56,-9,-92r54,0v2,35,-2,64,-8,92r-37,0","w":85},"(":{"d":"108,-262v-55,100,-54,241,0,338r-34,0v-31,-46,-53,-103,-55,-169v-1,-69,26,-126,56,-169r33,0","w":119},")":{"d":"101,-96v-1,69,-23,124,-55,172r-34,0v54,-95,55,-240,0,-338r33,0v31,44,56,98,56,166","w":119},"*":{"d":"43,-139r-26,-21r33,-34r-45,-11r10,-31v15,6,29,13,41,21v-3,-19,-4,-35,-4,-47r31,0v0,9,-1,24,-4,47r44,-19r9,32v-13,3,-28,5,-45,8r31,36r-27,18r-23,-40v-7,13,-16,27,-25,41","w":140},"+":{"d":"82,-37r0,-67r-67,0r0,-46r67,0r0,-67r45,0r0,67r68,0r0,46r-68,0r0,67r-45,0","w":210},",":{"d":"25,-49r49,0v2,53,-1,95,-44,106r-9,-20v19,-5,27,-15,28,-37r-24,0r0,-49","w":100},"-":{"d":"20,-69r0,-49r97,0r0,49r-97,0","w":119},"\u00ad":{"d":"20,-69r0,-49r97,0r0,49r-97,0","w":119},".":{"d":"26,0r0,-49r49,0r0,49r-49,0","w":100},"\/":{"d":"-1,4r64,-266r37,0r-64,266r-37,0","w":100},"0":{"d":"15,-128v0,-79,18,-131,84,-131v66,0,83,54,83,132v0,78,-17,131,-83,131v-65,0,-84,-50,-84,-132xm99,-37v48,0,32,-111,27,-152v-2,-18,-10,-28,-27,-29v-35,7,-32,41,-32,91v0,52,-4,83,32,90"},"1":{"d":"28,-194v27,-9,65,-37,74,-65r40,0r0,259r-50,0r0,-186v-18,17,-40,29,-64,37r0,-45","k":{"1":20}},"2":{"d":"182,-187v1,71,-71,97,-98,141r98,0r0,46r-173,0v3,-65,81,-112,113,-153v20,-24,12,-67,-23,-65v-23,2,-33,15,-35,40r-49,-4v5,-51,34,-76,85,-77v46,-1,82,29,82,72"},"3":{"d":"136,-139v91,25,42,143,-38,143v-46,0,-81,-29,-84,-72r47,-6v3,21,16,37,37,37v22,1,36,-18,36,-42v0,-32,-25,-50,-57,-37r5,-40v45,8,58,-61,13,-62v-18,1,-31,15,-32,34r-46,-7v8,-43,32,-65,80,-68v69,-4,108,91,39,120"},"4":{"d":"112,0r0,-52r-105,0r0,-43r111,-164r42,0r0,164r32,0r0,43r-32,0r0,52r-48,0xm112,-95r0,-88r-59,88r59,0"},"5":{"d":"189,-86v0,103,-162,125,-173,20r49,-5v2,19,18,36,37,36v24,0,37,-22,37,-51v0,-49,-52,-62,-77,-28r-40,-6r25,-134r131,0r0,46r-93,0r-8,44v58,-28,112,19,112,78"},"6":{"d":"15,-125v0,-82,27,-134,95,-134v42,0,66,26,73,64r-48,6v0,-32,-39,-38,-55,-15v-7,9,-12,28,-14,58v44,-51,121,-3,121,63v0,50,-33,89,-82,87v-63,-2,-90,-51,-90,-129xm105,-131v-21,0,-34,18,-34,44v0,27,14,50,36,50v23,0,32,-18,32,-45v0,-29,-11,-49,-34,-49"},"7":{"d":"50,0v2,-81,37,-158,78,-208r-113,0r0,-46r169,0r0,36v-43,45,-85,132,-86,218r-48,0"},"8":{"d":"15,-74v0,-32,17,-55,43,-65v-22,-9,-37,-26,-37,-53v0,-41,31,-67,77,-67v76,0,106,96,42,120v26,10,43,31,44,63v0,48,-35,81,-83,81v-48,0,-87,-32,-86,-79xm99,-220v-17,0,-31,13,-31,31v0,19,12,31,30,31v18,0,31,-12,31,-31v0,-18,-13,-31,-30,-31xm99,-118v-22,0,-36,19,-36,40v-1,24,16,43,37,43v22,0,35,-18,35,-43v0,-23,-15,-40,-36,-40"},"9":{"d":"184,-129v0,81,-28,134,-95,134v-43,0,-66,-26,-73,-65r48,-5v0,31,40,38,55,15v7,-9,12,-29,14,-59v-44,51,-122,5,-122,-63v0,-49,35,-89,83,-87v63,3,90,52,90,130xm94,-123v21,0,34,-20,34,-45v0,-27,-13,-50,-36,-50v-22,0,-32,18,-32,46v0,29,11,49,34,49"},":":{"d":"35,-137r0,-50r50,0r0,50r-50,0xm35,0r0,-49r50,0r0,49r-50,0","w":119},";":{"d":"34,-137r0,-50r49,0r0,50r-49,0xm34,-49r49,0v2,52,1,96,-43,106r-10,-20v18,-6,27,-16,28,-37r-24,0r0,-49","w":119},"\u037e":{"d":"34,-137r0,-50r49,0r0,50r-49,0xm34,-49r49,0v2,52,1,96,-43,106r-10,-20v18,-6,27,-16,28,-37r-24,0r0,-49","w":119},"<":{"d":"193,-29r-176,-77r0,-43r176,-76r0,50r-123,47r123,49r0,50","w":210},"=":{"d":"15,-143r0,-46r180,0r0,46r-180,0xm15,-65r0,-46r180,0r0,46r-180,0","w":210},">":{"d":"17,-29r0,-50r123,-48r-123,-48r0,-50r177,77r0,42","w":210},"?":{"d":"111,-260v61,0,113,51,83,105v-6,11,-48,44,-59,60v-3,5,-3,15,-3,29r-45,0v-12,-71,62,-74,68,-122v3,-21,-20,-35,-42,-35v-29,1,-43,17,-49,44r-45,-6v1,-44,43,-75,92,-75xm87,0r0,-49r50,0r0,49r-50,0","w":219},"@":{"d":"191,43v56,1,97,-14,121,-46r38,0v-25,51,-81,79,-156,79v-110,0,-183,-55,-183,-161v0,-107,70,-177,180,-177v89,0,146,50,149,135v1,66,-53,129,-116,127v-19,0,-28,-5,-32,-20v-43,44,-115,10,-115,-54v0,-76,86,-160,141,-93r5,-19r46,0r-29,141v0,6,2,9,7,9v36,-8,61,-49,62,-92v0,-63,-51,-102,-119,-102v-93,0,-147,60,-147,148v0,84,62,125,148,125xm176,-159v-37,0,-52,47,-54,83v-1,26,11,44,32,44v40,0,53,-47,55,-86v1,-23,-13,-41,-33,-41","w":351},"A":{"d":"259,0r-57,0r-23,-59r-103,0r-21,59r-55,0r100,-258r55,0xm163,-102r-36,-96r-35,96r71,0","w":259,"k":{"y":13,"w":7,"v":13,"Y":33,"W":20,"V":27,"T":27," ":13}},"B":{"d":"242,-75v0,66,-41,75,-128,75r-88,0r0,-258v88,3,202,-21,204,65v0,27,-18,47,-37,56v29,8,49,28,49,62xm179,-185v0,-43,-52,-27,-101,-30r0,60v45,-2,101,11,101,-30xm188,-77v0,-49,-61,-32,-110,-35r0,69v47,-3,110,14,110,-34","w":259},"C":{"d":"134,-40v34,0,51,-23,57,-55r51,16v-15,51,-46,83,-108,83v-71,0,-117,-54,-117,-131v0,-139,187,-188,224,-60r-52,13v-5,-24,-25,-45,-54,-44v-44,1,-64,35,-64,88v0,56,18,90,63,90","w":259},"D":{"d":"242,-126v0,80,-32,126,-118,126r-98,0r0,-258r95,0v89,-2,121,47,121,132xm188,-129v2,-75,-30,-91,-110,-85r0,171r39,0v59,2,70,-28,71,-86","w":259},"E":{"d":"26,0r0,-258r191,0r0,44r-139,0r0,57r130,0r0,43r-130,0r0,71r144,0r0,43r-196,0","w":240},"F":{"d":"27,0r0,-258r176,0r0,44r-124,0r0,61r107,0r0,43r-107,0r0,110r-52,0","w":219,"k":{"A":20,".":40,",":40}},"G":{"d":"71,-132v0,87,83,114,135,70r0,-33r-60,0r0,-43r112,0r0,102v-20,21,-69,41,-110,40v-82,-1,-131,-52,-131,-134v0,-80,44,-131,128,-132v62,0,99,26,110,76r-52,9v-7,-25,-27,-41,-58,-41v-49,1,-74,33,-74,86","w":280},"H":{"d":"26,0r0,-258r52,0r0,102r102,0r0,-102r52,0r0,258r-52,0r0,-113r-102,0r0,113r-52,0","w":259},"I":{"d":"25,0r0,-258r52,0r0,258r-52,0","w":100},"J":{"d":"87,-40v29,0,31,-16,32,-51r0,-167r52,0v-8,109,36,267,-85,262v-52,-2,-81,-30,-80,-84r49,-5v1,29,9,45,32,45"},"K":{"d":"27,0r0,-258r52,0r0,115r105,-115r70,0r-97,101r102,157r-67,0r-71,-121r-42,43r0,78r-52,0","w":259},"L":{"d":"28,0r0,-256r52,0r0,213r129,0r0,43r-181,0","w":219,"k":{"y":13,"Y":33,"W":20,"V":27,"T":27," ":7}},"M":{"d":"25,0r0,-258r78,0r47,176r46,-176r78,0r0,258r-48,0r0,-203r-51,203r-50,0r-51,-203r0,203r-49,0","w":299},"N":{"d":"27,0r0,-258r50,0r106,172r0,-172r48,0r0,258r-52,0r-104,-168r0,168r-48,0","w":259},"O":{"d":"141,4v-76,0,-126,-52,-125,-131v1,-85,41,-133,124,-135v78,-1,126,54,126,134v0,81,-48,132,-125,132xm141,-218v-48,0,-72,36,-72,89v0,53,25,89,72,89v48,0,71,-37,71,-90v0,-53,-24,-88,-71,-88","w":280},"P":{"d":"224,-178v0,76,-62,85,-146,81r0,97r-52,0r0,-258r84,0v81,-4,114,15,114,80xm170,-178v-1,-42,-45,-36,-92,-36r0,73v47,0,92,5,92,-37","w":240,"k":{"A":27,".":46,",":46," ":7}},"Q":{"d":"265,-129v0,43,-10,72,-31,96v13,9,26,17,41,22r-19,37v-27,-10,-23,-10,-58,-33v-94,36,-182,-18,-182,-122v0,-82,45,-133,125,-133v78,0,125,52,124,133xm69,-129v0,60,35,102,91,86v-11,-7,-21,-12,-32,-16r15,-29v17,6,33,14,49,26v38,-46,23,-162,-51,-156v-47,4,-72,36,-72,89","w":280},"R":{"d":"237,-185v0,42,-27,66,-68,71v42,23,61,73,89,114r-62,0r-65,-94v-11,-13,-27,-14,-53,-14r0,108r-52,0r0,-258r110,0v68,-3,101,17,101,73xm184,-182v0,-46,-59,-29,-106,-32r0,65v47,-3,106,12,106,-33","w":259,"k":{"Y":13,"W":7,"V":7}},"S":{"d":"184,-142v73,44,30,156,-65,147v-65,-6,-99,-31,-106,-89r51,-5v6,32,21,47,56,50v46,4,72,-50,26,-63v-47,-14,-124,-26,-124,-88v0,-77,119,-89,167,-51v16,14,25,33,26,57r-52,2v-5,-26,-17,-35,-47,-37v-29,-2,-59,20,-36,41v14,13,87,26,104,36","w":240},"T":{"d":"84,0r0,-214r-76,0r0,-44r205,0r0,44r-77,0r0,214r-52,0","w":219,"k":{"y":27,"w":27,"u":27,"s":27,"r":20,"o":27,"i":7,"e":27,"c":27,"a":27,"O":7,"A":27,";":40,":":40,".":40,"-":20,",":40}},"U":{"d":"132,4v-85,0,-106,-36,-106,-124r0,-138r52,0r0,140v-2,56,7,78,52,78v44,0,49,-24,49,-75r0,-143r52,0r0,136v4,90,-19,126,-99,126","w":259},"V":{"d":"92,0r-92,-258r56,0r65,191r64,-191r55,0r-93,258r-55,0","w":240,"k":{"y":13,"u":13,"r":20,"o":27,"i":7,"e":20,"a":20,"A":27,";":20,":":20,".":33,"-":20,",":33}},"W":{"d":"63,0r-62,-258r53,0r39,177r47,-177r62,0r46,180r39,-180r52,0r-62,258r-55,0r-52,-193r-51,193r-56,0","w":339,"k":{"y":7,"u":7,"r":7,"o":7,"i":3,"e":7,"a":13,"A":20,";":7,":":7,".":20,"-":7,",":20}},"X":{"d":"0,0r88,-134r-80,-124r61,0r52,83r50,-83r61,0r-80,125r88,133r-63,0r-57,-89r-58,89r-62,0","w":240},"Y":{"d":"94,0r0,-108r-95,-150r61,0r61,102r60,-102r59,0r-94,150r0,108r-52,0","w":240,"k":{"v":20,"u":20,"q":27,"p":20,"o":27,"i":13,"e":20,"a":20,"A":33,";":27,":":27,".":40,"-":20,",":40," ":7}},"Z":{"d":"4,0r0,-47r135,-167r-120,0r0,-44r189,0r0,41r-141,174r146,0r0,43r-209,0","w":219},"[":{"d":"26,73r0,-331r87,0r0,39r-40,0r0,253r40,0r0,39r-87,0","w":119},"\\":{"d":"-1,-262r37,0r64,266r-37,0","w":100},"]":{"d":"94,-258r0,331r-87,0r0,-39r40,0r0,-253r-40,0r0,-39r87,0","w":119},"^":{"d":"20,-122r66,-140r40,0r64,140r-50,0r-35,-86r-35,86r-50,0","w":210},"_":{"d":"-3,71r0,-32r205,0r0,32r-205,0"},"`":{"d":"87,-210r-31,0r-49,-52r56,0","w":119},"a":{"d":"95,-153v-20,1,-26,7,-32,23r-45,-8v11,-36,33,-54,81,-53v56,2,78,12,78,72v0,43,-5,93,11,119r-49,0r-6,-20v-30,38,-120,31,-120,-31v0,-60,78,-55,116,-71v1,-24,-8,-31,-34,-31xm90,-31v30,-1,43,-21,39,-59v-18,8,-68,8,-67,34v0,14,12,26,28,25"},"b":{"d":"206,-95v11,86,-93,131,-136,68r0,27r-46,0r0,-258r49,0r0,93v49,-57,143,-12,133,70xm114,-153v-27,0,-41,23,-41,56v0,37,14,62,43,62v27,0,39,-24,39,-58v0,-37,-12,-60,-41,-60","w":219},"c":{"d":"15,-93v0,-107,150,-136,174,-38r-49,8v-3,-19,-14,-30,-34,-29v-29,1,-40,20,-40,55v0,66,70,83,77,25r48,9v-10,42,-36,66,-86,67v-56,0,-90,-39,-90,-97"},"d":{"d":"15,-94v-9,-83,83,-128,133,-71r0,-93r49,0r0,258r-46,0r0,-27v-43,63,-147,18,-136,-67xm107,-153v-28,0,-42,23,-42,56v0,39,13,62,42,62v27,0,41,-26,41,-58v0,-36,-12,-60,-41,-60","w":219},"e":{"d":"62,-79v-6,46,63,64,72,20r49,8v-11,34,-38,54,-81,55v-57,1,-91,-38,-91,-96v-1,-56,33,-100,86,-99v61,1,92,43,89,112r-124,0xm137,-109v4,-38,-41,-58,-64,-32v-7,8,-10,19,-10,32r74,0"},"f":{"d":"124,-221v-27,-8,-49,-1,-43,34r37,0r0,39r-37,0r0,148r-49,0r0,-148r-28,0r0,-39r28,0v-11,-69,41,-86,98,-69","w":119},"g":{"d":"108,76v-56,1,-87,-16,-87,-64r57,7v2,17,10,18,28,19v42,3,43,-26,41,-68v-45,64,-140,15,-132,-64v-10,-85,90,-131,136,-66r0,-27r46,0r0,168v2,69,-24,94,-89,95xm106,-153v-27,0,-41,23,-41,56v0,34,14,57,40,57v28,0,43,-22,43,-56v0,-34,-14,-57,-42,-57","w":219},"h":{"d":"116,-153v-61,0,-36,94,-41,153r-49,0r0,-258r49,0r0,95v41,-52,121,-31,121,53r0,110r-50,0r0,-99v0,-39,-1,-54,-30,-54","w":219},"i":{"d":"26,-212r0,-46r49,0r0,46r-49,0xm26,0r0,-187r49,0r0,187r-49,0","w":100},"j":{"d":"25,-212r0,-46r49,0r0,46r-49,0xm-8,28v26,5,33,-2,33,-37r0,-178r49,0r0,181v9,72,-31,92,-91,76","w":100},"k":{"d":"24,0r0,-258r49,0r0,137r58,-66r61,0r-64,69r69,118r-54,0r-46,-84r-24,24r0,60r-49,0"},"l":{"d":"26,0r0,-258r49,0r0,258r-49,0","w":100},"m":{"d":"109,-153v-59,0,-31,95,-37,153r-50,0r0,-187r46,0r0,26v26,-39,92,-40,111,0v30,-48,118,-40,118,42r0,119r-50,0r0,-107v0,-33,-3,-46,-26,-46v-57,0,-32,95,-37,153r-49,0r0,-102v-1,-35,0,-51,-26,-51","w":320},"n":{"d":"71,-159v36,-53,125,-40,125,43r0,116r-50,0v-7,-52,23,-153,-30,-153v-61,0,-36,93,-41,153r-50,0r0,-187r46,0r0,28","w":219},"o":{"d":"111,4v-60,-1,-98,-38,-97,-100v1,-55,39,-95,97,-95v55,0,96,42,96,97v0,54,-41,100,-96,98xm111,-151v-29,0,-46,24,-46,58v0,34,17,57,46,57v28,0,45,-25,45,-58v0,-32,-17,-57,-45,-57","w":219},"p":{"d":"207,-94v0,82,-86,130,-133,71r0,94r-50,0r0,-258r46,0r0,28v11,-17,32,-32,59,-32v48,1,78,43,78,97xm115,-152v-27,0,-42,23,-42,55v0,35,14,62,43,62v27,0,40,-23,40,-59v0,-34,-13,-58,-41,-58","w":219},"q":{"d":"16,-95v0,-84,97,-130,136,-64r0,-28r45,0r0,258r-49,0r0,-94v-10,15,-31,27,-55,27v-49,-1,-77,-45,-77,-99xm107,-35v27,0,42,-27,42,-61v0,-34,-13,-56,-41,-56v-29,0,-42,23,-42,59v0,35,13,58,41,58","w":219},"r":{"d":"129,-139v-48,-23,-60,18,-56,81r0,58r-49,0r0,-187r46,0r0,27v14,-31,43,-39,75,-22","w":140,"k":{".":20,",":20}},"s":{"d":"167,-95v38,45,-4,99,-69,99v-49,0,-80,-20,-90,-57r50,-8v5,20,16,27,40,30v32,4,51,-29,15,-37v-64,-14,-92,-14,-98,-66v-7,-59,95,-69,136,-44v12,8,20,20,25,36r-46,9v0,-27,-63,-31,-69,-7v2,24,89,25,106,45"},"t":{"d":"115,-3v-47,18,-87,4,-87,-63r0,-81r-23,0r0,-40r23,0r0,-37r50,-29r0,66r33,0r0,40r-33,0r0,75v-3,35,5,40,33,31","w":119},"u":{"d":"105,-33v61,2,34,-93,40,-154r50,0r0,187r-46,0r0,-28v-29,50,-124,44,-124,-41r0,-118r49,0v7,55,-22,152,31,154","w":219},"v":{"d":"77,0r-75,-187r52,0r45,127r46,-127r51,0r-74,187r-45,0","k":{".":27,",":27}},"w":{"d":"61,0r-59,-187r48,0r35,123r32,-123r47,0r31,123r36,-123r49,0r-60,187r-48,0r-32,-120r-31,120r-48,0","w":280,"k":{".":13,",":13}},"x":{"d":"2,0r67,-96r-64,-91r60,0r33,52r35,-52r58,0r-63,89r69,98r-61,0r-38,-58r-38,58r-58,0"},"y":{"d":"2,-187r53,0r45,133r43,-133r51,0r-77,212v-11,40,-47,59,-98,48r-5,-39v33,9,54,-7,59,-33","k":{".":27,",":27}},"z":{"d":"6,0r0,-38r95,-109v-26,2,-60,1,-88,1r0,-41r154,0r0,35r-96,110r102,-1r0,43r-167,0","w":180},"{":{"d":"49,-3v0,-48,0,-64,-38,-69r0,-42v35,-2,40,-23,38,-63v-3,-69,17,-86,82,-85r0,42v-74,-12,-5,97,-69,127v31,9,33,64,33,101v0,24,9,25,36,26r0,42v-61,2,-82,-16,-82,-79","w":140},"|":{"d":"31,76r0,-338r39,0r0,338r-39,0","w":100},"}":{"d":"90,-183v-2,47,1,65,38,69r0,42v-35,2,-40,22,-38,62v3,70,-16,87,-82,86r0,-42v27,0,36,-2,36,-25v0,-37,1,-94,33,-102v-32,-24,-31,-39,-33,-100v-1,-26,-7,-27,-36,-27r0,-42v61,-2,84,15,82,79","w":140},"~":{"d":"146,-92v-27,0,-63,-25,-86,-24v-16,0,-32,9,-48,25r0,-46v35,-46,97,-12,138,0v19,-1,36,-11,48,-25r0,47v-9,11,-32,23,-52,23","w":210},"\u00c9":{"d":"92,-272r25,-53r55,0r-48,53r-32,0xm26,0r0,-258r191,0r0,44r-139,0r0,57r130,0r0,43r-130,0r0,71r144,0r0,43r-196,0","w":240},"\u00e1":{"d":"75,-210r25,-52r55,0r-48,52r-32,0xm95,-153v-20,1,-26,7,-32,23r-45,-8v11,-36,33,-54,81,-53v56,2,78,12,78,72v0,43,-5,93,11,119r-49,0r-6,-20v-30,38,-120,31,-120,-31v0,-60,78,-55,116,-71v1,-24,-8,-31,-34,-31xm90,-31v30,-1,43,-21,39,-59v-18,8,-68,8,-67,34v0,14,12,26,28,25"},"\u00e9":{"d":"74,-210r24,-52r55,0r-48,52r-31,0xm62,-79v-6,46,63,64,72,20r49,8v-11,34,-38,54,-81,55v-57,1,-91,-38,-91,-96v-1,-56,33,-100,86,-99v61,1,92,43,89,112r-124,0xm137,-109v4,-38,-41,-58,-64,-32v-7,8,-10,19,-10,32r74,0"},"\u00ed":{"d":"26,0r0,-187r49,0r0,187r-49,0xm22,-210r24,-52r56,0r-49,52r-31,0","w":100},"\u00f3":{"d":"86,-210r24,-52r55,0r-48,52r-31,0xm111,4v-60,-1,-98,-38,-97,-100v1,-55,39,-95,97,-95v55,0,96,42,96,97v0,54,-41,100,-96,98xm111,-151v-29,0,-46,24,-46,58v0,34,17,57,46,57v28,0,45,-25,45,-58v0,-32,-17,-57,-45,-57","w":219},"\u00fa":{"d":"85,-210r24,-52r55,0r-48,52r-31,0xm105,-33v61,2,34,-93,40,-154r50,0r0,187r-46,0r0,-28v-29,50,-124,44,-124,-41r0,-118r49,0v7,55,-22,152,31,154","w":219},"\u00c1":{"d":"97,-272r25,-53r55,0r-48,53r-32,0xm259,0r-57,0r-23,-59r-103,0r-21,59r-55,0r100,-258r55,0xm163,-102r-36,-96r-35,96r71,0","w":259},"\u00cd":{"d":"19,-272r24,-53r55,0r-48,53r-31,0xm25,0r0,-258r52,0r0,258r-52,0","w":100},"\u00d3":{"d":"109,-272r24,-53r55,0r-48,53r-31,0xm141,4v-76,0,-126,-52,-125,-131v1,-85,41,-133,124,-135v78,-1,126,54,126,134v0,81,-48,132,-125,132xm141,-218v-48,0,-72,36,-72,89v0,53,25,89,72,89v48,0,71,-37,71,-90v0,-53,-24,-88,-71,-88","w":280},"\u00da":{"d":"97,-272r24,-53r55,0r-48,53r-31,0xm132,4v-85,0,-106,-36,-106,-124r0,-138r52,0r0,140v-2,56,7,78,52,78v44,0,49,-24,49,-75r0,-143r52,0r0,136v4,90,-19,126,-99,126","w":259},"\u0160":{"d":"59,-325r40,0r19,26r20,-26r40,0r-37,51r-45,0xm184,-142v73,44,30,156,-65,147v-65,-6,-99,-31,-106,-89r51,-5v6,32,21,47,56,50v46,4,72,-50,26,-63v-47,-14,-124,-26,-124,-88v0,-77,119,-89,167,-51v16,14,25,33,26,57r-52,2v-5,-26,-17,-35,-47,-37v-29,-2,-59,20,-36,41v14,13,87,26,104,36","w":240},"\u0161":{"d":"36,-262r40,0r19,26r20,-26r40,0r-36,52r-46,0xm167,-95v38,45,-4,99,-69,99v-49,0,-80,-20,-90,-57r50,-8v5,20,16,27,40,30v32,4,51,-29,15,-37v-64,-14,-92,-14,-98,-66v-7,-59,95,-69,136,-44v12,8,20,20,25,36r-46,9v0,-27,-63,-31,-69,-7v2,24,89,25,106,45"},"\u017d":{"d":"48,-325r40,0r19,26r20,-26r40,0r-37,51r-45,0xm4,0r0,-47r135,-167r-120,0r0,-44r189,0r0,41r-141,174r146,0r0,43r-209,0","w":219},"\u017e":{"d":"30,-262r40,0r19,26r20,-26r40,0r-37,52r-45,0xm6,0r0,-38r95,-109v-26,2,-60,1,-88,1r0,-41r154,0r0,35r-96,110r102,-1r0,43r-167,0","w":180},"\u00dd":{"d":"87,-272r24,-53r56,0r-49,53r-31,0xm94,0r0,-108r-95,-150r61,0r61,102r60,-102r59,0r-94,150r0,108r-52,0","w":240},"\u00fd":{"d":"73,-210r25,-52r55,0r-48,52r-32,0xm2,-187r53,0r45,133r43,-133r51,0r-77,212v-11,40,-47,59,-98,48r-5,-39v33,9,54,-7,59,-33"},"\u010c":{"d":"73,-325r40,0r19,26r20,-26r40,0r-36,51r-46,0xm134,-40v34,0,51,-23,57,-55r51,16v-15,51,-46,83,-108,83v-71,0,-117,-54,-117,-131v0,-139,187,-188,224,-60r-52,13v-5,-24,-25,-45,-54,-44v-44,1,-64,35,-64,88v0,56,18,90,63,90","w":259},"\u010d":{"d":"48,-262r40,0r19,26r20,-26r40,0r-36,52r-46,0xm15,-93v0,-107,150,-136,174,-38r-49,8v-3,-19,-14,-30,-34,-29v-29,1,-40,20,-40,55v0,66,70,83,77,25r48,9v-10,42,-36,66,-86,67v-56,0,-90,-39,-90,-97"},"\u010e":{"d":"48,-325r40,0r19,26r20,-26r40,0r-36,51r-46,0xm242,-126v0,80,-32,126,-118,126r-98,0r0,-258r95,0v89,-2,121,47,121,132xm188,-129v2,-75,-30,-91,-110,-85r0,171r39,0v59,2,70,-28,71,-86","w":259},"\u010f":{"d":"214,-258r45,0v2,49,-2,87,-40,97r-8,-19v16,-6,25,-13,25,-33r-22,0r0,-45xm14,-94v-8,-82,83,-128,133,-71r0,-93r50,0r0,258r-46,0r0,-27v-43,63,-148,19,-137,-67xm106,-153v-27,0,-41,23,-41,56v0,38,12,62,41,62v27,0,41,-26,41,-58v0,-37,-12,-60,-41,-60","w":258},"\u011a":{"d":"59,-325r40,0r19,26r21,-26r39,0r-36,51r-46,0xm26,0r0,-258r191,0r0,44r-139,0r0,57r130,0r0,43r-130,0r0,71r144,0r0,43r-196,0","w":240},"\u011b":{"d":"39,-262r40,0r19,26r20,-26r40,0r-36,52r-46,0xm62,-79v-6,46,63,64,72,20r49,8v-11,34,-38,54,-81,55v-57,1,-91,-38,-91,-96v-1,-56,33,-100,86,-99v61,1,92,43,89,112r-124,0xm137,-109v4,-38,-41,-58,-64,-32v-7,8,-10,19,-10,32r74,0"},"\u0147":{"d":"66,-325r40,0r19,26r21,-26r39,0r-36,51r-46,0xm27,0r0,-258r50,0r106,172r0,-172r48,0r0,258r-52,0r-104,-168r0,168r-48,0","w":259},"\u0148":{"d":"51,-262r40,0r19,26r20,-26r40,0r-36,52r-46,0xm71,-159v36,-53,125,-40,125,43r0,116r-50,0v-7,-52,23,-153,-30,-153v-61,0,-36,93,-41,153r-50,0r0,-187r46,0r0,28","w":219},"\u0158":{"d":"52,-325r40,0r19,26r21,-26r39,0r-36,51r-46,0xm237,-185v0,42,-27,66,-68,71v42,23,61,73,89,114r-62,0r-65,-94v-11,-13,-27,-14,-53,-14r0,108r-52,0r0,-258r110,0v68,-3,101,17,101,73xm184,-182v0,-46,-59,-29,-106,-32r0,65v47,-3,106,12,106,-33","w":259},"\u0159":{"d":"14,-262r40,0r19,26r20,-26r40,0r-36,52r-46,0xm129,-139v-48,-23,-60,18,-56,81r0,58r-49,0r0,-187r46,0r0,27v14,-31,43,-39,75,-22","w":140},"\u0164":{"d":"48,-325r40,0r19,26r20,-26r40,0r-36,51r-46,0xm84,0r0,-214r-76,0r0,-44r205,0r0,44r-77,0r0,214r-52,0","w":219},"\u0165":{"d":"128,-258r45,0v2,49,-2,87,-40,97r-8,-19v16,-6,25,-13,25,-33r-22,0r0,-45xm115,-3v-47,18,-87,4,-87,-63r0,-81r-23,0r0,-40r23,0r0,-37r50,-29r0,66r33,0r0,40r-33,0r0,75v-5,36,5,39,33,31","w":172},"\u016e":{"d":"129,-331v17,0,34,16,34,34v0,18,-16,35,-34,35v-18,0,-35,-17,-35,-35v0,-18,17,-34,35,-34xm129,-281v9,1,15,-7,15,-16v0,-8,-7,-15,-15,-15v-8,0,-16,7,-16,15v0,8,7,17,16,16xm132,4v-85,0,-106,-36,-106,-124r0,-138r52,0r0,140v-2,56,7,78,52,78v44,0,49,-24,49,-75r0,-143r52,0r0,136v4,90,-19,126,-99,126","w":259},"\u016f":{"d":"110,-270v17,0,34,16,34,34v0,18,-17,35,-34,35v-17,0,-35,-17,-35,-35v0,-18,17,-34,35,-34xm110,-220v8,0,15,-8,15,-16v0,-8,-7,-16,-15,-16v-8,0,-16,8,-16,16v0,8,8,16,16,16xm105,-33v61,2,34,-93,40,-154r50,0r0,187r-46,0r0,-28v-29,50,-124,44,-124,-41r0,-118r49,0v7,55,-22,152,31,154","w":219}}});
/*!
 * The following copyright notice may not be removed under any circumstances.
 * 
 * Copyright:
 * © 2008 The Monotype Corporation. All Rights Reserved.
 * 
 * Trademark:
 * Arial is a trademark of The Monotype Corporation in the United States and/or
 * other countries.
 * 
 * Manufacturer:
 * The Monotype Corporation
 * 
 * Designer:
 * Monotype Type Drawing Office - Robin Nicholas, Patricia Saunders 1982
 */
Cufon.registerFont({"w":200,"face":{"font-family":"arial","font-weight":400,"font-style":"italic","font-stretch":"normal","units-per-em":"360","panose-1":"2 11 6 4 2 2 2 9 2 4","ascent":"288","descent":"-72","x-height":"4","bbox":"-44 -322 382 77.1171","underline-thickness":"26.3672","underline-position":"-24.9609","slope":"-12","unicode-range":"U+0020-U+017E"},"glyphs":{" ":{"w":100,"k":{"Y":7,"A":13}},"\u00a0":{"w":100},"!":{"d":"40,-65r20,-140r11,-53r38,0v-13,68,-32,129,-49,193r-20,0xm20,0r8,-36r36,0r-8,36r-36,0","w":100},"\"":{"d":"49,-166v0,-34,4,-65,11,-92r36,0v-6,34,-16,64,-28,92r-19,0xm107,-166v0,-34,4,-65,11,-92r36,0v-6,34,-16,64,-28,92r-19,0","w":127},"#":{"d":"31,4r15,-74r-29,0r0,-27r35,0r13,-63r-48,0r0,-27r53,0r15,-75r27,0r-16,75r56,0r15,-75r27,0r-16,75r31,0r0,27r-36,0r-13,63r49,0r0,27r-54,0r-16,74r-26,0r15,-74r-55,0r-16,74r-26,0xm78,-97r55,0r13,-63r-55,0"},"$":{"d":"190,-74v0,48,-40,83,-93,78r-6,30r-18,0r7,-32v-34,-7,-60,-38,-62,-77r32,-1v2,26,14,45,35,52r21,-97v-33,-15,-57,-30,-57,-70v0,-41,39,-74,86,-70r3,-14r17,0r-3,16v32,9,49,29,54,64r-30,1v-4,-20,-12,-33,-30,-39r-18,89v38,17,62,29,62,70xm130,-236v-38,-4,-63,35,-43,66v4,6,13,13,25,19xm102,-21v38,4,71,-39,49,-74v-5,-7,-14,-13,-29,-19"},"%":{"d":"50,9r213,-271r29,0r-212,271r-30,0xm82,-124v-32,0,-49,-19,-47,-54v2,-42,20,-82,64,-82v34,0,51,17,51,50v0,42,-21,87,-68,86xm100,-239v-26,0,-37,39,-38,66v-1,17,6,26,20,27v31,1,38,-40,40,-68v1,-15,-9,-25,-22,-25xm307,-77v0,42,-20,88,-68,86v-32,-1,-49,-19,-47,-54v3,-41,19,-81,65,-81v33,1,50,17,50,49xm258,-105v-28,0,-37,39,-39,66v0,17,7,26,21,27v29,1,38,-40,39,-68v0,-15,-8,-25,-21,-25","w":320},"&":{"d":"202,-213v0,40,-27,50,-64,71v15,28,30,51,44,69v9,-10,17,-23,25,-37r27,14v-8,16,-18,32,-32,48v8,10,18,21,30,35r-24,19v-12,-10,-21,-20,-29,-31v-26,20,-37,29,-73,31v-44,2,-78,-31,-78,-73v0,-50,29,-66,68,-85v-31,-47,-5,-109,51,-110v31,-1,55,21,55,49xm147,-237v-33,0,-41,43,-21,71v24,-14,42,-21,45,-46v2,-13,-12,-25,-24,-25xm61,-71v0,53,69,64,99,21v-22,-29,-39,-54,-51,-77v-28,14,-48,25,-48,56","w":240},"'":{"d":"46,-166v0,-34,4,-65,11,-92r36,0v-6,34,-16,64,-28,92r-19,0","w":68},"(":{"d":"149,-262v-67,69,-116,211,-67,338r-24,0v-18,-40,-28,-82,-28,-125v0,-102,40,-150,94,-213r25,0","w":119},")":{"d":"-19,76v66,-70,117,-211,67,-338r23,0v19,40,28,82,28,124v0,103,-39,151,-93,214r-25,0","w":119},"*":{"d":"41,-210r9,-25v19,7,32,12,40,17v-2,-21,-3,-36,-3,-44r25,0v0,12,-2,27,-4,44v12,-6,26,-12,42,-17r8,25v-15,5,-30,7,-44,9v7,6,17,18,30,34r-21,15v-7,-9,-15,-22,-24,-38v-9,17,-16,29,-23,38r-21,-15v14,-17,24,-29,30,-34v-15,-3,-30,-5,-44,-9","w":140},"+":{"d":"102,-42r0,-70r-70,0r0,-30r70,0r0,-70r30,0r0,70r70,0r0,30r-70,0r0,70r-30,0","w":210},",":{"d":"20,0r7,-36r36,0v-7,40,-15,84,-54,88r3,-14v14,-4,23,-16,27,-38r-19,0","w":100},"-":{"d":"17,-77r6,-32r97,0r-6,32r-97,0","w":119},"\u00ad":{"d":"17,-77r6,-32r97,0r-6,32r-97,0","w":119},".":{"d":"21,0r7,-36r36,0r-7,36r-36,0","w":100},"\/":{"d":"-18,4r138,-266r28,0r-139,266r-27,0","w":100},"0":{"d":"94,4v-44,0,-72,-38,-69,-89v5,-84,29,-174,109,-174v45,0,72,36,70,86v-4,82,-29,177,-110,177xm135,-233v-63,0,-73,96,-79,157v-3,32,12,55,40,55v60,0,73,-102,77,-160v2,-33,-10,-52,-38,-52"},"1":{"d":"87,0r40,-195v-18,14,-42,26,-74,34r6,-29v36,-16,76,-38,95,-69r19,0r-54,259r-32,0","k":{"1":27}},"2":{"d":"202,-190v1,75,-103,101,-136,161r115,0r-6,29r-154,0v13,-85,110,-104,146,-171v16,-30,-9,-63,-40,-62v-31,2,-44,22,-51,53r-31,-5v5,-43,36,-74,82,-74v44,0,73,27,75,69"},"3":{"d":"158,-132v65,36,13,136,-58,136v-47,0,-77,-29,-80,-72r31,-3v3,32,17,49,47,50v30,0,57,-26,58,-55v0,-30,-24,-47,-58,-44r6,-26v35,5,65,-15,65,-45v1,-23,-19,-43,-42,-42v-26,1,-44,21,-48,47r-31,-6v8,-38,39,-66,82,-67v40,-1,71,29,71,67v-1,32,-19,48,-43,60"},"4":{"d":"108,0r13,-66r-105,0r7,-31r144,-161r26,0r-34,164r36,0r-6,28r-36,0r-14,66r-31,0xm127,-94r23,-107r-96,107r73,0"},"5":{"d":"98,4v-46,0,-74,-31,-73,-78r32,-3v-1,31,14,56,43,56v39,0,63,-39,65,-78v3,-55,-75,-60,-96,-21r-28,-2r39,-132r126,0r-6,29r-98,0r-19,66v43,-36,118,-7,113,57v-4,60,-38,106,-98,106"},"6":{"d":"175,-192v-1,-38,-36,-51,-64,-29v-18,13,-32,49,-39,72v40,-43,121,-20,121,51v0,51,-36,102,-88,102v-47,0,-78,-38,-75,-90v5,-80,30,-173,112,-173v38,0,59,27,62,64xm119,-146v-60,-3,-84,119,-14,125v60,1,84,-122,14,-125"},"7":{"d":"52,0v18,-86,66,-172,120,-225r-128,0r6,-29r164,0r-6,29v-56,46,-105,146,-123,225r-33,0"},"8":{"d":"27,-66v0,-39,23,-67,54,-76v-58,-30,-16,-117,49,-117v42,0,73,24,73,63v-1,31,-17,48,-43,58v64,37,16,143,-59,143v-42,0,-74,-29,-74,-71xm133,-233v-28,1,-49,18,-49,46v-1,23,17,37,40,37v54,0,69,-85,9,-83xm116,-127v-33,0,-59,28,-57,64v0,26,19,40,45,42v54,4,81,-107,12,-106"},"9":{"d":"198,-168v-4,83,-31,169,-111,172v-38,1,-61,-25,-63,-63r30,-3v1,41,44,52,69,24v14,-16,26,-38,33,-67v-42,44,-120,17,-120,-52v0,-51,36,-103,88,-102v46,1,76,39,74,91xm124,-233v-63,-2,-80,121,-14,125v61,2,84,-120,14,-125"},":":{"d":"52,-151r8,-36r35,0r-7,36r-36,0xm21,0r7,-36r36,0r-8,36r-35,0","w":100},";":{"d":"51,-151r8,-36r35,0r-7,36r-36,0xm20,0r7,-36r36,0v-7,40,-15,84,-54,88r3,-14v14,-4,23,-16,27,-38r-19,0","w":100},"\u037e":{"d":"51,-151r8,-36r35,0r-7,36r-36,0xm20,0r7,-36r36,0v-7,40,-15,84,-54,88r3,-14v14,-4,23,-16,27,-38r-19,0","w":100},"<":{"d":"32,-113r0,-29r171,-72r0,31r-135,56r135,56r0,31","w":210},"=":{"d":"202,-152r-170,0r0,-29r170,0r0,29xm202,-73r-170,0r0,-30r170,0r0,30","w":210},">":{"d":"203,-113r-171,73r0,-31r136,-56r-136,-56r0,-31r171,72r0,29","w":210},"?":{"d":"202,-199v1,62,-89,74,-97,134r-30,0v1,-66,88,-76,95,-136v3,-20,-20,-37,-42,-36v-31,2,-46,20,-50,55r-32,-5v9,-45,34,-75,82,-75v40,0,73,24,74,63xm60,0r7,-36r36,0r-7,36r-36,0"},"@":{"d":"238,1v-22,0,-33,-7,-34,-30v-13,16,-30,30,-54,30v-108,0,-62,-192,28,-192v25,0,42,14,53,33r6,-27r31,0r-30,145v0,7,5,11,12,11v38,-8,68,-51,68,-97v0,-70,-56,-111,-126,-111v-89,0,-145,64,-146,152v-1,91,61,134,151,135v57,0,101,-22,124,-53r31,0v-26,46,-78,80,-155,79v-107,-1,-177,-53,-177,-158v0,-107,64,-180,174,-180v88,0,146,52,150,137v3,58,-51,127,-106,126xm180,-164v-61,-1,-88,129,-23,139v41,-6,61,-45,64,-89v1,-28,-16,-50,-41,-50","w":365},"A":{"d":"-7,0r146,-258r40,0r43,258r-33,0r-13,-74r-104,0r-41,74r-38,0xm87,-101r85,0r-17,-129v-17,41,-47,89,-68,129","w":240,"k":{"y":3,"w":7,"v":7,"Y":27,"W":7,"V":20,"T":27," ":13}},"B":{"d":"230,-82v0,49,-39,82,-90,82r-124,0r54,-258v76,1,166,-13,166,61v-1,33,-20,53,-48,63v25,8,42,23,42,52xm204,-194v0,-46,-60,-32,-106,-34r-17,80v56,0,123,7,123,-46xm195,-81v1,-51,-71,-34,-120,-37r-19,89v0,0,137,9,139,-52","w":240},"C":{"d":"137,-24v43,0,69,-31,80,-67r34,5v-18,52,-55,89,-116,90v-65,1,-102,-41,-102,-110v0,-108,111,-201,201,-134v18,14,26,34,29,59r-32,3v-5,-35,-25,-55,-62,-56v-62,-2,-102,62,-102,128v0,49,25,82,70,82","w":259},"D":{"d":"147,-258v121,-16,131,138,75,207v-27,33,-55,51,-113,51r-93,0r54,-258r77,0xm221,-154v2,-73,-49,-78,-123,-74r-41,199v106,9,161,-30,164,-125","w":259},"E":{"d":"16,0r54,-258r186,0r-6,30r-152,0r-16,80r147,0r-6,29r-148,0r-18,90r162,0r-6,29r-197,0","w":240},"F":{"d":"16,0r54,-258r168,0r-6,30r-134,0r-17,82r136,0r-6,29r-136,0r-24,117r-35,0","w":219,"k":{"A":27,".":46,",":46," ":7}},"G":{"d":"70,-103v-3,84,84,97,144,57r12,-56r-79,0r7,-29r112,0r-21,105v-25,16,-63,30,-103,30v-67,0,-107,-41,-107,-107v0,-107,85,-189,191,-149v31,12,43,34,50,70r-34,3v-8,-34,-28,-54,-67,-54v-69,0,-103,57,-105,130","w":280},"H":{"d":"15,0r54,-258r34,0r-22,107r134,0r22,-107r34,0r-53,258r-35,0r25,-121r-133,0r-25,121r-35,0","w":259},"I":{"d":"21,0r54,-258r34,0r-54,258r-34,0","w":100},"J":{"d":"126,-13v-43,38,-139,12,-111,-62r32,-2v-21,49,44,72,65,32v18,-66,31,-144,47,-213r34,0r-39,189v-6,26,-15,45,-28,56","w":180},"K":{"d":"16,0r54,-258r34,0r-26,124r140,-124r49,0r-120,105r88,153r-39,0r-74,-131r-54,47r-18,84r-34,0","w":240},"L":{"d":"14,0r54,-258r35,0r-48,229r134,0r-6,29r-169,0","k":{"y":7,"Y":33,"W":13,"V":20,"T":27," ":7}},"M":{"d":"16,0r54,-258r42,0r26,167v3,22,6,43,7,63v33,-70,88,-159,126,-230r43,0r-54,258r-34,0r27,-125v6,-29,15,-62,27,-98v-36,76,-84,150,-124,223r-33,0r-26,-165v-2,-15,-4,-33,-5,-53v-10,83,-28,142,-43,218r-33,0","w":299},"N":{"d":"18,0r54,-258r33,0v30,75,66,137,90,219r44,-219r33,0r-53,258r-34,0r-91,-218v-10,72,-29,148,-43,218r-33,0","w":259},"O":{"d":"141,4v-67,2,-107,-47,-108,-112v-3,-85,58,-153,136,-154v65,-1,111,48,109,115v-3,86,-51,149,-137,151xm169,-233v-59,1,-104,59,-102,127v1,48,30,82,76,82v66,0,98,-58,101,-125v2,-48,-30,-84,-75,-84","w":280},"P":{"d":"251,-194v-3,87,-85,94,-179,89r-22,105r-35,0r54,-258v80,3,185,-20,182,64xm217,-194v1,-52,-70,-32,-119,-36r-20,96v70,2,138,4,139,-60","w":240,"k":{"A":27,".":46,",":46," ":13}},"Q":{"d":"278,-147v-1,56,-26,101,-60,126v9,10,20,20,35,30r-16,21v-16,-10,-30,-23,-42,-38v-80,38,-166,-14,-162,-104v4,-85,50,-148,137,-150v65,-1,109,48,108,115xm153,-75v20,8,27,17,44,32v26,-20,47,-62,47,-106v0,-48,-30,-84,-74,-84v-64,0,-101,57,-103,123v-2,58,49,102,107,80v-11,-10,-22,-17,-33,-23","w":280},"R":{"d":"263,-195v-2,50,-35,73,-87,79v36,28,48,72,67,116r-39,0v-23,-45,-21,-115,-89,-114r-40,0r-24,114r-34,0r54,-258v81,4,195,-23,192,63xm230,-195v2,-54,-81,-28,-131,-34r-18,87v71,0,147,10,149,-53","w":259,"k":{"Y":13,"W":7,"V":7,"T":7}},"S":{"d":"195,-124v63,46,9,135,-70,128v-60,-5,-101,-23,-100,-87r34,-3v-3,44,25,62,67,62v43,0,82,-34,55,-67v-26,-32,-128,-39,-124,-102v2,-47,39,-69,90,-69v56,0,94,26,95,77r-34,3v0,-38,-25,-47,-62,-51v-49,-5,-77,49,-33,70v8,5,71,31,82,39","w":240},"T":{"d":"82,0r47,-228r-84,0r6,-30r203,0r-6,30r-84,0r-48,228r-34,0","w":219,"k":{"y":27,"w":27,"u":27,"s":33,"r":27,"o":33,"i":3,"e":33,"c":33,"a":33,"O":7,"A":27,";":27,":":27,".":33,"-":33,",":33}},"U":{"d":"219,-45v-31,68,-189,70,-184,-25v3,-58,26,-130,36,-188r35,0r-37,188v0,60,103,56,121,10v21,-52,31,-137,47,-198r35,0v-17,69,-27,155,-53,213","w":259},"V":{"d":"94,0r-49,-258r33,0r30,154v6,28,8,50,10,67r119,-221r35,0r-141,258r-37,0","w":240,"k":{"y":7,"u":7,"r":7,"o":13,"i":7,"e":13,"a":13,"A":20,";":7,":":7,".":27,"-":13,",":27}},"W":{"d":"61,0r-16,-258r35,0r8,211r109,-211r36,0r10,213r104,-213r35,0r-131,258r-37,0r-10,-205v-34,75,-72,134,-108,205r-35,0","w":339,"k":{"i":3,"e":7,"a":7,"A":7,".":13,"-":7,",":13}},"X":{"d":"-11,0r123,-130r-73,-128r38,0r58,106v24,-31,68,-74,97,-106r45,0r-125,133r71,125r-38,0r-56,-104v-28,36,-64,70,-95,104r-45,0","w":240},"Y":{"d":"101,0r20,-100r-79,-158r37,0r62,128v25,-43,65,-88,96,-128r41,0r-123,161r-20,97r-34,0","w":240,"k":{"v":13,"u":13,"q":20,"p":20,"o":20,"i":7,"e":20,"a":27,"A":20,";":13,":":13,".":33,"-":27,",":33," ":7}},"Z":{"d":"9,0r3,-26r172,-204r-139,2r7,-30r177,0r-3,27r-170,203v48,-3,100,0,150,-1r-6,29r-191,0","w":219},"[":{"d":"2,70r68,-328r71,0r-5,25r-39,0r-58,279r39,0r-5,24r-71,0","w":100},"\\":{"d":"74,4r-43,-266r24,0r43,266r-24,0","w":100},"]":{"d":"49,70r-70,0r5,-24r39,0r58,-279r-38,0r5,-25r70,0","w":100},"^":{"d":"58,-121r-33,0r62,-141r26,0r62,141r-32,0r-43,-105","w":168},"_":{"d":"-23,72r0,-23r210,0r0,23r-210,0"},"`":{"d":"87,-209r-35,-49r39,0r20,49r-24,0","w":119},"a":{"d":"119,-191v51,-1,79,29,66,83v-9,35,-22,71,-11,108r-32,0v-2,-6,-3,-14,-4,-23v-31,39,-122,38,-122,-27v0,-67,83,-55,138,-67v12,-30,-4,-49,-36,-48v-28,1,-44,13,-52,34r-32,-3v13,-35,39,-57,85,-57xm47,-51v0,48,79,31,89,-1v6,-10,11,-25,14,-43v-34,13,-103,-1,-103,44"},"b":{"d":"168,-35v-20,43,-106,56,-121,0r-7,35r-28,0r54,-258r32,0r-20,92v39,-46,115,-22,115,51v0,33,-11,62,-25,80xm122,-165v-42,0,-62,50,-63,94v-2,29,15,49,40,49v43,0,59,-53,62,-94v2,-28,-15,-49,-39,-49"},"c":{"d":"52,-68v0,75,80,49,89,0r32,3v-13,40,-39,68,-85,69v-42,1,-68,-29,-68,-74v0,-83,76,-156,146,-104v13,10,18,26,18,45r-31,2v0,-22,-15,-38,-37,-38v-48,0,-64,51,-64,97","w":180},"d":{"d":"19,-72v0,-86,94,-165,144,-85r21,-101r31,0r-53,258r-30,0r6,-27v-41,57,-119,31,-119,-45xm112,-165v-42,0,-57,47,-61,87v-3,35,10,56,39,57v57,2,98,-144,22,-144"},"e":{"d":"92,-22v26,0,48,-19,57,-41r31,3v-9,29,-47,65,-88,64v-47,-1,-73,-31,-73,-79v0,-61,37,-115,99,-116v55,-1,82,47,71,106r-137,0v-5,33,11,63,40,63xm161,-110v11,-50,-46,-72,-79,-42v-11,9,-19,23,-25,42r104,0"},"f":{"d":"16,0r34,-162r-28,0r5,-25r28,0v9,-37,9,-77,57,-75v8,0,20,2,35,5r-6,28v-28,-7,-47,-8,-50,22r-4,20r36,0r-5,25r-36,0r-34,162r-32,0","w":100},"g":{"d":"149,40v-22,50,-152,50,-139,-23r32,3v-5,41,61,32,76,14v6,-8,15,-38,19,-59v-45,52,-119,17,-119,-55v0,-84,101,-155,150,-76r6,-31r29,0v-19,74,-27,164,-54,227xm112,-165v-63,0,-91,139,-22,139v41,0,65,-45,66,-89v0,-28,-16,-50,-44,-50"},"h":{"d":"154,-113v21,-49,-20,-62,-53,-43v-43,24,-43,100,-57,156r-32,0r54,-258r32,0r-21,99v20,-18,35,-32,65,-32v90,0,25,129,20,191r-32,0"},"i":{"d":"57,-222r8,-36r31,0r-7,36r-32,0xm11,0r39,-187r32,0r-39,187r-32,0","w":79},"j":{"d":"57,-222r8,-36r31,0r-7,36r-32,0xm-44,70r6,-27v34,8,40,-4,48,-41r39,-189r32,0r-40,195v-8,52,-31,78,-85,62","w":79},"k":{"d":"12,0r54,-258r32,0r-33,160r92,-89r42,0r-79,70r48,117r-35,0r-37,-96r-39,34r-13,62r-32,0","w":180},"l":{"d":"9,0r54,-258r32,0r-54,258r-32,0","w":79},"m":{"d":"148,-126v13,-37,-19,-46,-46,-30v-44,26,-43,100,-58,156r-32,0r39,-187r32,0r-7,31v21,-21,31,-34,62,-35v25,-1,41,14,45,35v19,-37,109,-56,109,7v0,49,-20,101,-29,149r-31,0r29,-145v-7,-40,-67,-9,-75,11v-14,34,-23,92,-33,134r-32,0","w":299},"n":{"d":"155,-118v6,-26,5,-47,-22,-47v-74,0,-72,100,-89,165r-32,0r39,-187r29,0r-7,33v21,-21,37,-37,69,-37v90,0,24,129,20,191r-32,0"},"o":{"d":"94,4v-47,0,-76,-27,-76,-75v0,-62,37,-121,101,-120v45,0,76,31,75,78v-1,65,-38,117,-100,117xm118,-166v-47,0,-67,46,-69,92v-1,32,16,54,45,54v46,0,68,-45,69,-93v1,-31,-17,-53,-45,-53"},"p":{"d":"193,-116v-5,64,-32,120,-92,120v-22,0,-40,-11,-52,-34r-21,102r-32,0r54,-259r30,0r-6,26v36,-52,125,-30,119,45xm121,-165v-43,0,-59,48,-62,89v-3,37,12,52,41,54v56,4,94,-143,21,-143"},"q":{"d":"111,-191v27,0,43,16,53,39r7,-35r28,0r-54,259r-32,0r20,-93v-45,50,-118,19,-115,-51v3,-63,34,-119,93,-119xm112,-165v-42,2,-59,48,-62,89v-2,32,14,54,40,54v41,0,61,-51,62,-94v2,-27,-16,-49,-40,-49"},"r":{"d":"71,-149v19,-27,42,-55,80,-35r-13,29v-74,-24,-80,89,-96,155r-30,0r39,-187r28,0","w":119,"k":{".":13,"-":7,",":20}},"s":{"d":"152,-88v38,40,-4,96,-61,92v-44,-3,-79,-21,-76,-68r32,-2v-2,31,19,45,46,46v23,1,41,-10,42,-29v-8,-45,-94,-32,-94,-88v0,-53,84,-70,120,-38v12,11,20,25,20,43r-32,2v5,-40,-78,-50,-78,-12v0,28,74,39,81,54","w":180},"t":{"d":"58,-59v-11,31,0,39,28,33r-5,26v-40,11,-76,-8,-56,-54r22,-108r-25,0r5,-25r26,0r9,-46r37,-22r-15,68r32,0r-6,25r-31,0","w":100},"u":{"d":"58,-67v-7,25,-4,46,22,45v77,-4,70,-99,89,-165r32,0r-39,187r-30,0r7,-34v-22,25,-45,38,-68,38v-91,0,-26,-128,-20,-191r32,0"},"v":{"d":"59,0r-31,-187r31,0r23,158r86,-158r33,0r-107,187r-35,0","w":180,"k":{".":27,",":27}},"w":{"d":"47,0r-19,-187r31,0r12,153v16,-54,45,-103,66,-153r34,0r8,150v16,-41,49,-106,69,-150r32,0r-92,187r-33,0r-8,-149r-66,149r-34,0","w":259,"k":{".":20,",":20}},"x":{"d":"-1,0r82,-95r-47,-92r35,0r32,69r54,-69r39,0r-79,95r47,92r-35,0r-32,-68r-56,68r-40,0","w":180},"y":{"d":"0,72r2,-30v38,13,49,-17,62,-41r-31,-188r31,0r21,151r84,-151r33,0r-119,212v-20,37,-37,59,-83,47","w":180,"k":{".":27,",":27}},"z":{"d":"7,0r5,-25r100,-113v7,-8,15,-15,24,-24v-38,4,-64,1,-102,2r6,-27r144,0r-4,20r-127,141v43,-3,68,-2,110,-2r-6,28r-150,0","w":180},"{":{"d":"87,76v-85,12,-44,-77,-40,-126v2,-18,-10,-29,-28,-29r6,-29v86,-5,12,-165,135,-154r-6,28v-68,-7,-35,93,-76,124v-7,5,-15,12,-27,17v44,14,16,85,11,124v1,16,10,17,31,17","w":120},"|":{"d":"33,76r0,-338r28,0r0,338r-28,0","w":93},"}":{"d":"79,-93v-44,-16,-14,-84,-11,-125v1,-16,-12,-17,-31,-16r6,-28v36,-3,54,6,55,36v2,38,-43,116,13,118r-6,29v-86,10,-20,171,-135,155r6,-28v55,12,44,-67,58,-95v11,-23,22,-37,45,-46","w":120},"~":{"d":"75,-122v-23,0,-30,10,-46,24r0,-36v34,-41,91,-8,134,3v19,0,36,-14,46,-25r0,38v-14,12,-26,19,-49,20v-28,1,-59,-24,-85,-24","w":210},"\u00c9":{"d":"131,-274r33,-48r40,0r-47,48r-26,0xm16,0r54,-258r186,0r-6,30r-152,0r-16,80r147,0r-6,29r-148,0r-18,90r162,0r-6,29r-197,0","w":240},"\u00e1":{"d":"98,-209r33,-49r40,0r-47,49r-26,0xm119,-191v51,-1,79,29,66,83v-9,35,-22,71,-11,108r-32,0v-2,-6,-3,-14,-4,-23v-31,39,-122,38,-122,-27v0,-67,83,-55,138,-67v12,-30,-4,-49,-36,-48v-28,1,-44,13,-52,34r-32,-3v13,-35,39,-57,85,-57xm47,-51v0,48,79,31,89,-1v6,-10,11,-25,14,-43v-34,13,-103,-1,-103,44"},"\u00e9":{"d":"101,-209r33,-49r40,0r-47,49r-26,0xm92,-22v26,0,48,-19,57,-41r31,3v-9,29,-47,65,-88,64v-47,-1,-73,-31,-73,-79v0,-61,37,-115,99,-116v55,-1,82,47,71,106r-137,0v-5,33,11,63,40,63xm161,-110v11,-50,-46,-72,-79,-42v-11,9,-19,23,-25,42r104,0"},"\u00ed":{"d":"22,0r39,-187r32,0r-39,187r-32,0xm53,-209r33,-49r40,0r-47,49r-26,0","w":100},"\u00f3":{"d":"94,-209r33,-49r40,0r-46,49r-27,0xm94,4v-47,0,-76,-27,-76,-75v0,-62,37,-121,101,-120v45,0,76,31,75,78v-1,65,-38,117,-100,117xm118,-166v-47,0,-67,46,-69,92v-1,32,16,54,45,54v46,0,68,-45,69,-93v1,-31,-17,-53,-45,-53"},"\u00fa":{"d":"103,-209r33,-49r40,0r-47,49r-26,0xm58,-67v-7,25,-4,46,22,45v77,-4,70,-99,89,-165r32,0r-39,187r-30,0r7,-34v-22,25,-45,38,-68,38v-91,0,-26,-128,-20,-191r32,0"},"\u00c1":{"d":"138,-274r33,-48r40,0r-46,48r-27,0xm-7,0r146,-258r40,0r43,258r-33,0r-13,-74r-104,0r-41,74r-38,0xm87,-101r85,0r-17,-129v-17,41,-47,89,-68,129","w":240},"\u00cd":{"d":"67,-274r33,-48r40,0r-47,48r-26,0xm21,0r54,-258r34,0r-54,258r-34,0","w":100},"\u00d3":{"d":"144,-274r33,-48r40,0r-46,48r-27,0xm141,4v-67,2,-107,-47,-108,-112v-3,-85,58,-153,136,-154v65,-1,111,48,109,115v-3,86,-51,149,-137,151xm169,-233v-59,1,-104,59,-102,127v1,48,30,82,76,82v66,0,98,-58,101,-125v2,-48,-30,-84,-75,-84","w":280},"\u00da":{"d":"141,-274r33,-48r40,0r-47,48r-26,0xm219,-45v-31,68,-189,70,-184,-25v3,-58,26,-130,36,-188r35,0r-37,188v0,60,103,56,121,10v21,-52,31,-137,47,-198r35,0v-17,69,-27,155,-53,213","w":259},"\u0160":{"d":"215,-322r-46,48r-35,0r-22,-48r28,0r13,31r29,-31r33,0xm195,-124v63,46,9,135,-70,128v-60,-5,-101,-23,-100,-87r34,-3v-3,44,25,62,67,62v43,0,82,-34,55,-67v-26,-32,-128,-39,-124,-102v2,-47,39,-69,90,-69v56,0,94,26,95,77r-34,3v0,-38,-25,-47,-62,-51v-49,-5,-77,49,-33,70v8,5,71,31,82,39","w":240},"\u0161":{"d":"181,-258r-46,49r-35,0r-22,-49r28,0r13,32r29,-32r33,0xm152,-88v38,40,-4,96,-61,92v-44,-3,-79,-21,-76,-68r32,-2v-2,31,19,45,46,46v23,1,41,-10,42,-29v-8,-45,-94,-32,-94,-88v0,-53,84,-70,120,-38v12,11,20,25,20,43r-32,2v5,-40,-78,-50,-78,-12v0,28,74,39,81,54","w":180},"\u017d":{"d":"197,-322r-47,48r-35,0r-21,-48r27,0r14,31r29,-31r33,0xm9,0r3,-26r172,-204r-139,2r7,-30r177,0r-3,27r-170,203v48,-3,100,0,150,-1r-6,29r-191,0","w":219},"\u017e":{"d":"175,-258r-47,49r-35,0r-21,-49r27,0r14,32r29,-32r33,0xm7,0r5,-25r100,-113v7,-8,15,-15,24,-24v-38,4,-64,1,-102,2r6,-27r144,0r-4,20r-127,141v43,-3,68,-2,110,-2r-6,28r-150,0","w":180},"\u00dd":{"d":"133,-274r33,-48r40,0r-47,48r-26,0xm101,0r20,-100r-79,-158r37,0r62,128v25,-43,65,-88,96,-128r41,0r-123,161r-20,97r-34,0","w":240},"\u00fd":{"d":"92,-209r33,-49r40,0r-47,49r-26,0xm0,72r2,-30v38,13,49,-17,62,-41r-31,-188r31,0r21,151r84,-151r33,0r-119,212v-20,37,-37,59,-83,47","w":180},"\u010c":{"d":"232,-322r-46,48r-36,0r-21,-48r28,0r13,31r29,-31r33,0xm137,-24v43,0,69,-31,80,-67r34,5v-18,52,-55,89,-116,90v-65,1,-102,-41,-102,-110v0,-108,111,-201,201,-134v18,14,26,34,29,59r-32,3v-5,-35,-25,-55,-62,-56v-62,-2,-102,62,-102,128v0,49,25,82,70,82","w":259},"\u010d":{"d":"185,-258r-46,49r-35,0r-22,-49r28,0r13,32r29,-32r33,0xm52,-68v0,75,80,49,89,0r32,3v-13,40,-39,68,-85,69v-42,1,-68,-29,-68,-74v0,-83,76,-156,146,-104v13,10,18,26,18,45r-31,2v0,-22,-15,-38,-37,-38v-48,0,-64,51,-64,97","w":180},"\u010e":{"d":"208,-322r-47,48r-35,0r-22,-48r28,0r14,31r29,-31r33,0xm147,-258v121,-16,131,138,75,207v-27,33,-55,51,-113,51r-93,0r54,-258r77,0xm221,-154v2,-73,-49,-78,-123,-74r-41,199v106,9,161,-30,164,-125","w":259},"\u010f":{"d":"20,-72v0,-86,94,-165,143,-85r21,-101r32,0r-54,258r-29,0r6,-27v-41,56,-119,32,-119,-45xm113,-165v-43,0,-59,47,-62,87v-3,34,10,56,40,57v57,2,96,-144,22,-144xm228,-225r7,-33r33,0v-6,37,-14,76,-50,80r3,-13v12,-4,21,-15,25,-34r-18,0","w":225},"\u011a":{"d":"220,-322r-46,48r-35,0r-22,-48r28,0r13,31r29,-31r33,0xm16,0r54,-258r186,0r-6,30r-152,0r-16,80r147,0r-6,29r-148,0r-18,90r162,0r-6,29r-197,0","w":240},"\u011b":{"d":"185,-258r-46,49r-35,0r-22,-49r28,0r13,32r29,-32r33,0xm92,-22v26,0,48,-19,57,-41r31,3v-9,29,-47,65,-88,64v-47,-1,-73,-31,-73,-79v0,-61,37,-115,99,-116v55,-1,82,47,71,106r-137,0v-5,33,11,63,40,63xm161,-110v11,-50,-46,-72,-79,-42v-11,9,-19,23,-25,42r104,0"},"\u0147":{"d":"229,-322r-46,48r-36,0r-21,-48r28,0r13,31r29,-31r33,0xm18,0r54,-258r33,0v30,75,66,137,90,219r44,-219r33,0r-53,258r-34,0r-91,-218v-10,72,-29,148,-43,218r-33,0","w":259},"\u0148":{"d":"191,-258r-47,49r-35,0r-22,-49r28,0r13,32r30,-32r33,0xm155,-118v6,-26,5,-47,-22,-47v-74,0,-72,100,-89,165r-32,0r39,-187r29,0r-7,33v21,-21,37,-37,69,-37v90,0,24,129,20,191r-32,0"},"\u0158":{"d":"218,-322r-47,48r-35,0r-22,-48r28,0r14,31r29,-31r33,0xm263,-195v-2,50,-35,73,-87,79v36,28,48,72,67,116r-39,0v-23,-45,-21,-115,-89,-114r-40,0r-24,114r-34,0r54,-258v81,4,195,-23,192,63xm230,-195v2,-54,-81,-28,-131,-34r-18,87v71,0,147,10,149,-53","w":259},"\u0159":{"d":"163,-258r-47,49r-35,0r-22,-49r28,0r14,32r29,-32r33,0xm71,-149v19,-27,42,-55,80,-35r-13,29v-74,-24,-80,89,-96,155r-30,0r39,-187r28,0","w":119},"\u0164":{"d":"212,-322r-46,48r-35,0r-22,-48r28,0r13,31r29,-31r33,0xm82,0r47,-228r-84,0r6,-30r203,0r-6,30r-84,0r-48,228r-34,0","w":219},"\u0165":{"d":"131,-225r7,-33r32,0v-5,38,-14,76,-49,80r3,-13v13,-4,21,-15,25,-34r-18,0xm57,-59v-12,31,1,39,28,33r-5,26v-40,11,-76,-8,-56,-54r22,-108r-25,0r5,-25r26,0r9,-46r37,-22r-15,68r32,0r-6,25r-31,0","w":127},"\u016e":{"d":"172,-258v-18,1,-33,-14,-32,-32v0,-18,15,-32,32,-32v17,0,31,15,32,32v0,17,-14,32,-32,32xm172,-308v-10,-1,-20,8,-19,18v-1,10,9,20,19,19v10,1,19,-10,19,-19v0,-9,-9,-19,-19,-18xm219,-45v-31,68,-189,70,-184,-25v3,-58,26,-130,36,-188r35,0r-37,188v0,60,103,56,121,10v21,-52,31,-137,47,-198r35,0v-17,69,-27,155,-53,213","w":259},"\u016f":{"d":"127,-200v-18,0,-32,-15,-32,-32v0,-17,14,-32,32,-32v18,-1,32,14,32,32v0,18,-14,33,-32,32xm127,-251v-9,0,-19,9,-18,19v-1,10,9,19,18,19v9,0,20,-9,19,-19v1,-10,-10,-19,-19,-19xm58,-67v-7,25,-4,46,22,45v77,-4,70,-99,89,-165r32,0r-39,187r-30,0r7,-34v-22,25,-45,38,-68,38v-91,0,-26,-128,-20,-191r32,0"}}});
/*!
 * The following copyright notice may not be removed under any circumstances.
 * 
 * Copyright:
 * © 2008 The Monotype Corporation. All Rights Reserved.
 * 
 * Trademark:
 * Arial is a trademark of The Monotype Corporation in the United States and/or
 * other countries.
 * 
 * Manufacturer:
 * The Monotype Corporation
 * 
 * Designer:
 * Monotype Type Drawing Office - Robin Nicholas, Patricia Saunders 1982
 */
Cufon.registerFont({"w":200,"face":{"font-family":"arial","font-weight":700,"font-style":"italic","font-stretch":"normal","units-per-em":"360","panose-1":"2 11 7 4 2 2 2 9 2 4","ascent":"288","descent":"-72","x-height":"4","bbox":"-39 -326 384 77.5779","underline-thickness":"37.793","underline-position":"-19.3359","slope":"-12","unicode-range":"U+0020-U+017E"},"glyphs":{" ":{"w":100,"k":{"Y":7,"A":13}},"\u00a0":{"w":100},"!":{"d":"73,-66r-27,0r16,-131r12,-61r53,0v-11,71,-34,130,-54,192xm32,-49r50,0r-10,49r-50,0","w":119},"\"":{"d":"54,-166v-1,-35,3,-65,11,-92r53,0v-5,34,-15,64,-27,92r-37,0xm118,-166v-1,-35,3,-65,11,-92r53,0v-5,34,-15,64,-27,92r-37,0","w":170},"#":{"d":"41,-64r-24,0r0,-39r32,0r10,-52r-42,0r0,-39r50,0r14,-68r40,0r-14,68r39,0r13,-68r41,0r-14,68r24,0r0,39r-32,0r-11,52r43,0r0,39r-51,0r-13,68r-40,0r14,-68r-39,0r-14,68r-40,0xm99,-155r-10,52r39,0r10,-52r-39,0"},"$":{"d":"191,-76v2,46,-42,83,-91,81r-6,31r-26,0r7,-34v-33,-9,-57,-37,-59,-77r44,-2v2,20,11,33,24,39r16,-77v-31,-13,-54,-37,-54,-73v0,-46,37,-76,85,-74r3,-15r25,0r-4,18v30,8,48,29,52,63r-43,2v-2,-13,-8,-22,-17,-27r-14,70v35,13,57,36,58,75xm123,-225v-38,-1,-48,50,-13,64xm108,-34v29,-1,52,-28,37,-55v-3,-5,-11,-10,-22,-16"},"%":{"d":"81,-127v-30,0,-49,-20,-48,-51v0,-42,24,-86,68,-84v31,0,50,20,49,53v-2,43,-23,82,-69,82xm99,-232v-25,1,-43,69,-15,76v18,-1,30,-38,30,-60v0,-10,-6,-16,-15,-16xm85,11r-40,0r214,-273r41,0xm242,11v-29,0,-49,-20,-48,-51v0,-42,25,-86,68,-85v31,0,50,20,49,53v-2,44,-24,83,-69,83xm260,-95v-22,0,-27,39,-29,59v-1,11,4,17,14,17v18,0,30,-37,30,-59v0,-10,-6,-18,-15,-17","w":320},"&":{"d":"217,-213v0,34,-28,56,-60,72r39,58v6,-6,14,-16,22,-29r36,22v-6,12,-18,31,-28,39v7,7,15,15,25,24r-31,33v-9,-4,-24,-18,-31,-25v-46,41,-165,26,-159,-50v4,-48,28,-67,66,-86v-29,-54,2,-107,61,-107v33,0,60,20,60,49xm156,-229v-26,0,-31,31,-17,53v19,-11,32,-17,35,-37v0,-10,-7,-17,-18,-16xm80,-73v0,41,51,45,81,22v-18,-22,-34,-44,-47,-68v-23,12,-34,27,-34,46","w":259},"'":{"d":"54,-166v-1,-35,3,-65,11,-92r53,0v-5,34,-15,64,-27,92r-37,0","w":85},"(":{"d":"157,-262v-74,73,-111,210,-71,338r-34,0v-16,-37,-28,-84,-28,-131v0,-97,41,-146,94,-207r39,0","w":119},")":{"d":"-28,76v73,-74,112,-211,70,-338r35,0v16,37,28,84,28,131v0,96,-42,146,-95,207r-38,0","w":119},"*":{"d":"73,-139r-26,-21r33,-34r-45,-11r11,-31v15,6,29,13,41,21v-3,-19,-4,-35,-4,-47r31,0v0,9,-2,24,-5,47r44,-19r10,32v-13,3,-28,5,-45,8r31,36r-27,18r-24,-40v-7,13,-16,27,-25,41","w":140},"+":{"d":"97,-37r0,-67r-68,0r0,-46r68,0r0,-67r45,0r0,67r67,0r0,46r-67,0r0,67r-45,0","w":210},",":{"d":"26,-49r50,0v-9,50,-16,106,-72,105r5,-23v16,-5,25,-14,29,-33r-23,0","w":100},"-":{"d":"24,-117r98,0r-10,48r-98,0","w":119},"\u00ad":{"d":"24,-117r98,0r-10,48r-98,0","w":119},".":{"d":"26,-49r50,0r-10,49r-50,0","w":100},"\/":{"d":"-16,4r128,-266r35,0r-127,266r-36,0","w":100},"0":{"d":"95,4v-46,0,-73,-37,-72,-88v4,-82,34,-175,111,-175v47,0,74,37,72,89v-3,78,-33,174,-111,174xm132,-218v-46,0,-56,95,-59,144v-2,23,5,38,24,38v48,0,53,-98,59,-146v3,-22,-6,-36,-24,-36"},"1":{"d":"43,-148r9,-45v43,-19,77,-41,101,-66r31,0r-54,259r-51,0r37,-179v-18,12,-49,27,-73,31","k":{"1":27}},"2":{"d":"130,-219v-22,0,-30,17,-35,42r-49,-8v6,-43,35,-71,82,-74v75,-4,99,85,50,132v-20,20,-59,54,-79,81r89,0r-10,46r-156,0v13,-82,91,-108,130,-172v12,-21,1,-47,-22,-47"},"3":{"d":"158,-132v67,36,11,142,-60,136v-46,-4,-75,-28,-80,-71r49,-6v3,24,9,34,31,36v22,1,40,-18,40,-41v0,-24,-16,-36,-42,-34r9,-42v26,4,50,-12,47,-37v-4,-43,-57,-29,-60,8r-46,-9v12,-40,39,-64,83,-67v80,-6,97,109,29,127"},"4":{"d":"111,-53r-101,0r9,-42r139,-163r44,0r-34,163r31,0r-9,42r-31,0r-11,53r-48,0xm120,-95r17,-81r-68,81r51,0"},"5":{"d":"198,-102v0,81,-93,140,-154,85v-15,-13,-21,-33,-21,-57r49,-4v-1,24,8,39,29,41v44,3,72,-101,17,-101v-17,0,-27,9,-37,19r-42,-4r39,-131r130,0r-10,46r-85,0r-12,40v48,-22,97,13,97,66"},"6":{"d":"29,-93v-4,-97,69,-207,157,-150v11,11,18,26,21,48r-47,4v1,-29,-30,-34,-46,-17v-9,10,-17,25,-23,47v48,-31,106,8,103,65v-3,56,-35,101,-90,101v-52,0,-72,-40,-75,-98xm118,-139v-42,-1,-60,97,-12,103v42,1,58,-97,12,-103"},"7":{"d":"37,-208r10,-46r170,0r-8,36v-52,47,-99,140,-117,218r-48,0v18,-79,56,-153,103,-208r-110,0"},"8":{"d":"24,-67v0,-37,23,-66,53,-75v-55,-34,-15,-117,54,-117v43,0,74,25,73,64v-1,30,-19,47,-44,57v68,37,14,150,-61,143v-43,-4,-75,-29,-75,-72xm130,-220v-18,0,-33,16,-33,35v0,16,10,27,26,27v17,0,34,-17,34,-34v0,-17,-10,-28,-27,-28xm114,-119v-40,-5,-60,82,-12,84v41,5,61,-83,12,-84"},"9":{"d":"201,-161v0,97,-72,208,-158,149v-13,-9,-19,-27,-20,-47r47,-4v-1,29,30,34,46,17v10,-10,17,-25,23,-47v-48,31,-103,-8,-103,-65v0,-51,38,-102,90,-101v51,1,75,43,75,98xm112,-116v42,3,60,-98,12,-102v-41,-2,-58,97,-12,102"},":":{"d":"64,-187r50,0r-10,49r-50,0xm36,-49r49,0r-10,49r-50,0","w":119},";":{"d":"65,-187r50,0r-10,49r-50,0xm37,-49r50,0v-9,50,-16,106,-72,105r5,-23v16,-5,25,-14,29,-33r-23,0","w":119},"\u037e":{"d":"65,-187r50,0r-10,49r-50,0xm37,-49r50,0v-9,50,-16,106,-72,105r5,-23v16,-5,25,-14,29,-33r-23,0","w":119},"<":{"d":"207,-29r-176,-77r0,-43r176,-76r0,50r-123,47r123,49r0,50","w":210},"=":{"d":"29,-143r0,-46r180,0r0,46r-180,0xm29,-65r0,-46r180,0r0,46r-180,0","w":210},">":{"d":"31,-29r0,-50r123,-48r-123,-48r0,-50r177,77r0,42","w":210},"?":{"d":"223,-197v1,57,-89,77,-100,133r-45,0v-1,-63,84,-85,97,-136v0,-17,-15,-26,-35,-25v-30,1,-42,17,-49,45r-47,-8v11,-43,46,-73,97,-74v47,-1,81,26,82,65xm72,-49r50,0r-10,49r-50,0","w":219},"@":{"d":"204,43v56,1,96,-15,121,-46r37,0v-25,51,-80,79,-155,79v-111,0,-184,-56,-184,-161v0,-106,70,-177,181,-177v88,1,147,50,149,135v1,66,-53,129,-116,127v-19,0,-28,-5,-32,-20v-43,44,-116,10,-116,-54v0,-75,87,-160,142,-93r4,-19r47,0r-29,141v0,6,2,9,7,9v35,-9,62,-50,62,-92v0,-62,-51,-102,-119,-102v-93,0,-148,60,-148,148v0,83,62,125,149,125xm189,-159v-37,0,-52,47,-54,83v0,26,10,44,31,44v39,0,53,-45,55,-86v1,-23,-12,-41,-32,-41","w":351},"A":{"d":"184,-57r-103,0r-31,57r-54,0r146,-258r59,0r41,258r-50,0xm177,-100r-15,-104r-62,104r77,0","w":259,"k":{"Y":27,"W":20,"V":27,"T":27," ":13}},"B":{"d":"249,-83v0,58,-44,83,-113,83r-122,0r54,-258v82,3,188,-18,188,63v0,33,-20,52,-49,61v24,6,42,24,42,51xm203,-189v0,-37,-53,-23,-91,-26r-13,61v46,-1,103,8,104,-35xm195,-79v0,-41,-63,-28,-105,-30r-14,68v52,-1,119,10,119,-38","w":259},"C":{"d":"138,-40v34,0,54,-24,63,-53r54,8v-17,52,-57,90,-120,90v-66,0,-101,-43,-101,-112v0,-113,112,-198,204,-133v19,13,27,35,30,61r-50,5v-6,-27,-20,-42,-49,-42v-56,0,-80,57,-83,111v-1,38,19,65,52,65","w":259},"D":{"d":"139,-258v149,-25,144,170,66,232v-38,30,-118,25,-189,26r54,-258r69,0xm208,-152v3,-59,-33,-67,-94,-63r-37,174v93,10,127,-33,131,-111","w":259},"E":{"d":"15,0r54,-258r191,0r-9,43r-138,0r-13,59r134,0r-9,43r-134,0r-16,70r150,0r-9,43r-201,0","w":240},"F":{"d":"14,0r54,-258r180,0r-9,43r-127,0r-13,62r125,0r-9,43r-125,0r-23,110r-53,0","w":219,"k":{"A":20,".":40,",":40}},"G":{"d":"83,-104v-5,73,75,73,124,48r8,-39r-66,0r9,-43r116,0r-24,111v-26,17,-68,31,-110,31v-72,0,-108,-41,-108,-107v0,-90,53,-158,143,-159v61,-1,96,30,108,81r-50,6v-7,-27,-25,-44,-57,-44v-62,0,-89,52,-93,115","w":280},"H":{"d":"192,-115r-99,0r-24,115r-53,0r54,-258r53,0r-21,100r99,0r21,-100r53,0r-54,258r-53,0","w":259},"I":{"d":"12,0r54,-258r53,0r-53,258r-54,0","w":100},"J":{"d":"60,-78v-14,39,39,49,57,26v18,-52,32,-145,47,-206r52,0v-19,75,-27,193,-67,240v-37,43,-158,26,-138,-55"},"K":{"d":"14,0r54,-258r53,0r-23,110r119,-110r71,0r-115,101r85,157r-60,0r-64,-123r-50,44r-16,79r-54,0","w":259},"L":{"d":"16,0r54,-258r53,0r-45,215r131,0r-9,43r-184,0","w":219,"k":{"Y":27,"W":20,"V":20,"T":27," ":7}},"M":{"d":"163,0r-50,0r-10,-215r-41,215r-47,0r53,-258r76,0r8,181r88,-181r76,0r-54,258r-48,0r51,-214","w":299},"N":{"d":"221,0r-50,0r-69,-173r-36,173r-50,0r54,-258r50,0r69,173r36,-173r50,0","w":259},"O":{"d":"137,5v-66,0,-106,-44,-106,-106v0,-91,50,-159,145,-161v62,-1,108,44,106,108v-3,88,-55,159,-145,159xm171,-218v-53,-1,-87,63,-87,116v0,35,24,63,59,62v54,-2,83,-59,86,-113v1,-37,-23,-64,-58,-65","w":280},"P":{"d":"253,-193v-3,84,-66,101,-165,95r-20,98r-53,0r54,-258v81,2,187,-19,184,65xm200,-189v2,-37,-50,-23,-87,-26r-16,74v60,2,100,-1,103,-48","w":240,"k":{"A":27,".":46,",":46," ":13}},"Q":{"d":"282,-154v-1,54,-25,103,-58,128v11,11,24,20,36,27r-25,33v-16,-8,-32,-21,-46,-39v-77,32,-162,-15,-158,-97v5,-86,54,-160,145,-160v62,-1,108,44,106,108xm162,-42v-2,-12,-20,-19,-29,-23r20,-30v16,8,29,20,41,33v41,-33,57,-159,-23,-156v-59,2,-84,54,-87,113v-2,43,32,74,78,63","w":280},"R":{"d":"267,-190v-2,48,-30,75,-79,80v27,30,36,59,58,110r-57,0v-15,-23,-23,-113,-76,-107r-22,0r-22,107r-53,0r54,-258v86,4,201,-23,197,68xm214,-189v1,-37,-62,-23,-100,-26r-15,70v59,0,113,5,115,-44","w":259,"k":{"Y":7,"W":7,"T":7}},"S":{"d":"208,-123v48,55,-9,132,-84,127v-60,-4,-103,-25,-101,-87r50,-3v2,36,15,43,51,46v38,3,66,-29,40,-51v-32,-27,-110,-33,-110,-96v0,-76,112,-95,162,-54v17,14,25,33,27,57r-50,2v5,-43,-85,-54,-88,-11v4,26,19,25,47,39v29,14,48,23,56,31","w":240},"T":{"d":"127,0r-53,0r45,-215r-76,0r9,-43r203,0r-9,43r-74,0","w":219,"k":{"y":13,"w":13,"u":7,"s":13,"r":7,"o":13,"i":7,"e":13,"c":13,"a":13,"O":7,"A":27,";":27,":":27,".":27,"-":20,",":27}},"U":{"d":"225,-49v-33,80,-215,69,-191,-41r35,-168r53,0r-37,183v-3,34,49,45,75,28v23,-15,25,-32,33,-70r30,-141r52,0v-16,66,-28,154,-50,209","w":259},"V":{"d":"144,0r-57,0r-46,-258r53,0r32,195r107,-195r53,0","w":240,"k":{"y":7,"u":7,"r":7,"o":13,"i":13,"e":13,"a":13,"A":27,";":13,":":13,".":33,"-":13,",":33}},"W":{"d":"260,0r-54,0r-6,-188r-93,188r-55,0r-10,-258r52,0r2,181r89,-181r57,0r6,179r85,-179r51,0","w":339,"k":{"y":7,"u":7,"r":7,"o":7,"i":3,"e":7,"a":7,"A":20,";":13,":":13,".":27,"-":13,",":27}},"X":{"d":"58,0r-69,0r114,-130r-64,-128r55,0r45,89r77,-89r66,0r-118,136r64,122r-60,0r-40,-83v-10,15,-51,62,-70,83","w":240},"Y":{"d":"144,0r-53,0r21,-100r-71,-158r57,0r47,111v23,-38,52,-73,76,-111r61,0r-118,163","w":240,"k":{"v":13,"u":13,"q":13,"p":13,"o":13,"i":13,"e":13,"a":13,"A":27,";":20,":":20,".":33,"-":27,",":33," ":7}},"Z":{"d":"9,0r8,-41r149,-174r-120,0r9,-43r185,0r-7,41r-150,175r135,-1r-9,43r-200,0","w":219},"[":{"d":"97,33r-8,38r-85,0r68,-329r86,0r-8,40r-39,0r-52,251r38,0","w":119},"\\":{"d":"68,4r-40,-266r35,0r40,266r-35,0","w":100},"]":{"d":"41,-220r8,-38r86,0r-69,329r-86,0r8,-39r39,0r53,-252r-39,0","w":119},"^":{"d":"38,-122r66,-140r39,0r64,140r-49,0r-35,-86r-35,86r-50,0","w":210},"_":{"d":"-3,71r0,-32r205,0r0,32r-205,0"},"`":{"d":"48,-263r49,0r22,52r-34,0","w":119},"a":{"d":"143,-136v-2,-28,-55,-24,-57,2r-50,-4v12,-34,39,-52,85,-53v42,-1,70,16,71,50v1,36,-29,100,-15,141r-49,0v-2,-7,-4,-14,-4,-21v-26,39,-112,31,-108,-29v3,-43,27,-59,76,-62v24,-2,40,-4,48,-7v2,-7,3,-13,3,-17xm64,-54v0,33,51,21,59,1v3,-7,8,-22,11,-34v-32,7,-70,4,-70,33"},"b":{"d":"217,-114v-6,63,-31,118,-93,118v-27,0,-46,-12,-59,-35r-6,31r-46,0r54,-258r50,0r-18,86v44,-40,125,-14,118,58xm133,-155v-52,-1,-78,121,-16,121v35,0,49,-41,51,-78v0,-23,-13,-43,-35,-43","w":219},"c":{"d":"72,-70v0,55,62,35,69,0r49,8v-14,39,-44,65,-91,66v-48,1,-77,-31,-77,-79v0,-88,90,-148,159,-99v14,10,20,27,22,46r-48,5v-1,-19,-12,-31,-30,-31v-37,0,-53,44,-53,84"},"d":{"d":"21,-74v0,-56,37,-119,93,-117v25,0,43,10,56,30r20,-97r51,0r-54,258r-48,0r4,-20v-39,46,-122,23,-122,-54xm121,-154v-49,0,-77,116,-16,121v54,1,75,-114,16,-121","w":219},"e":{"d":"125,-191v59,0,86,54,71,113r-126,0v-9,47,58,64,75,20r45,8v-15,32,-42,54,-84,54v-50,1,-85,-35,-85,-86v0,-61,43,-109,104,-109xm154,-108v6,-43,-37,-61,-63,-35v-8,8,-13,20,-16,35r79,0"},"f":{"d":"144,-187r-7,37r-36,0r-31,150r-51,0r32,-150r-29,0r8,-37r28,0v8,-43,15,-75,63,-75v15,0,31,2,48,8r-9,36v-25,-8,-47,-13,-48,18r-3,13r35,0","w":119,"k":{"f":7}},"g":{"d":"166,48v-32,46,-171,42,-154,-38r53,8v0,34,59,24,65,0r9,-39v-46,45,-120,17,-117,-54v3,-63,32,-116,90,-116v28,0,48,17,58,37r7,-33r47,0r-32,156v-9,39,-11,57,-26,79xm120,-155v-47,0,-74,112,-15,118v53,1,74,-112,15,-118","w":219},"h":{"d":"158,-111v16,-38,-16,-54,-42,-35v-36,25,-36,94,-50,146r-51,0r54,-258r51,0r-20,92v30,-32,116,-38,113,22v-3,46,-20,99,-28,144r-51,0","w":219},"i":{"d":"68,-258r51,0r-10,46r-50,0xm53,-187r51,0r-39,187r-51,0","w":100},"j":{"d":"69,-258r50,0r-9,46r-51,0xm54,-187r50,0v-16,69,-33,190,-57,240v-12,26,-56,28,-86,17r8,-42v45,9,41,-8,52,-60","w":100},"k":{"d":"14,0r54,-258r50,0r-28,134r66,-63r65,0r-75,68r40,119r-50,0r-26,-86r-34,30r-12,56r-50,0"},"l":{"d":"14,0r54,-258r50,0r-53,258r-51,0","w":100},"m":{"d":"147,-113v21,-46,-30,-52,-48,-24v-21,32,-25,93,-36,137r-50,0r39,-187r47,0r-4,23v30,-35,93,-39,105,6v18,-37,117,-51,113,11v-3,47,-20,101,-29,147r-51,0r29,-138v-4,-28,-39,-17,-52,3v-18,28,-27,94,-37,135r-50,0","w":320},"n":{"d":"157,-106v18,-44,-12,-60,-42,-40v-36,24,-34,96,-49,146r-51,0r39,-187r48,0r-5,25v29,-35,119,-45,116,19v-2,43,-20,99,-28,143r-50,0","w":219},"o":{"d":"109,4v-53,0,-86,-31,-87,-82v-2,-66,42,-114,106,-113v54,0,87,32,88,84v0,60,-44,111,-107,111xm111,-35v55,0,82,-116,17,-118v-38,-1,-54,39,-56,75v0,24,15,43,39,43","w":219},"p":{"d":"218,-111v10,82,-96,159,-149,85r-20,97r-51,0r54,-258r48,0r-4,19v43,-44,132,-21,122,57xm133,-155v-54,-1,-74,116,-15,121v51,1,77,-118,15,-121","w":219},"q":{"d":"21,-73v6,-60,32,-117,93,-118v27,0,46,12,58,34r7,-30r46,0r-54,258r-50,0r18,-87v-41,41,-125,15,-118,-57xm121,-154v-51,-1,-76,116,-16,121v54,1,76,-115,16,-121","w":219},"r":{"d":"51,-187r47,0r-8,37v25,-34,43,-50,81,-36r-20,42v-72,-15,-74,81,-89,144r-50,0","w":140,"k":{".":20,",":20}},"s":{"d":"168,-96v46,42,-6,100,-68,100v-52,0,-81,-19,-92,-56r49,-8v8,19,17,27,42,28v20,1,44,-12,31,-29v-37,-23,-94,-21,-94,-70v0,-76,153,-82,163,-11r-47,8v-4,-25,-69,-32,-69,-5v0,25,76,26,85,43"},"t":{"d":"107,2v-38,6,-81,1,-78,-36v2,-28,17,-83,23,-115r-25,0r8,-38r24,0r7,-30r57,-34r-13,64r31,0r-8,38r-31,0r-21,102v3,15,15,14,34,11","w":119},"u":{"d":"142,-25v-35,40,-117,44,-117,-19v0,-43,20,-100,28,-143r51,0r-28,136v11,41,65,4,71,-20v8,-33,17,-80,25,-116r51,0r-39,187r-47,0","w":219},"v":{"d":"108,0r-44,0r-37,-187r49,0r20,126r72,-126r55,0","k":{".":20,",":20}},"w":{"d":"210,0r-48,0r-9,-119r-57,119r-47,0r-23,-187r45,0r13,125r58,-125r46,0r6,125r58,-125r51,0","w":280,"k":{".":13,",":13}},"x":{"d":"100,-52r-46,52r-62,0r86,-96r-47,-91r54,0r27,54r47,-54r61,0r-86,97r47,90r-54,0"},"y":{"d":"30,-187r50,0r18,144v18,-49,48,-99,72,-144r53,0r-137,241v-15,22,-52,28,-84,16r5,-37v29,7,42,-4,56,-33","k":{".":13,",":13}},"z":{"d":"6,0r7,-34r102,-113r-83,0r8,-40r147,0r-6,30r-104,116r90,0r-8,41r-153,0","w":180},"{":{"d":"33,35v0,-32,37,-109,-18,-107r9,-42v91,-6,13,-166,152,-148r-8,42v-38,0,-37,2,-45,36v-14,56,-15,66,-52,91v34,14,13,86,9,112v3,14,11,15,32,15r-9,42v-41,1,-70,-3,-70,-41","w":140},"|":{"d":"31,76r0,-338r39,0r0,338r-39,0","w":100},"}":{"d":"113,-222v1,32,-38,110,18,108r-9,42v-90,5,-13,166,-153,148r10,-42v35,-2,36,-4,44,-36v12,-57,16,-68,52,-91v-35,-20,-14,-74,-10,-113v-2,-16,-10,-14,-32,-14r10,-42v40,-1,69,3,70,40","w":140},"~":{"d":"159,-91v-27,0,-64,-26,-87,-25v-16,0,-32,9,-48,25r0,-46v14,-15,27,-24,53,-24v46,0,98,49,134,-1r0,47v-10,10,-33,24,-52,24","w":210},"\u00c9":{"d":"189,-325r54,0r-57,52r-34,0xm15,0r54,-258r191,0r-9,43r-138,0r-13,59r134,0r-9,43r-134,0r-16,70r150,0r-9,43r-201,0","w":240},"\u00e1":{"d":"150,-263r54,0r-57,53r-33,0xm143,-136v-2,-28,-55,-24,-57,2r-50,-4v12,-34,39,-52,85,-53v42,-1,70,16,71,50v1,36,-29,100,-15,141r-49,0v-2,-7,-4,-14,-4,-21v-26,39,-112,31,-108,-29v3,-43,27,-59,76,-62v24,-2,40,-4,48,-7v2,-7,3,-13,3,-17xm64,-54v0,33,51,21,59,1v3,-7,8,-22,11,-34v-32,7,-70,4,-70,33"},"\u00e9":{"d":"149,-263r53,0r-57,53r-33,0xm125,-191v59,0,86,54,71,113r-126,0v-9,47,58,64,75,20r45,8v-15,32,-42,54,-84,54v-50,1,-85,-35,-85,-86v0,-61,43,-109,104,-109xm154,-108v6,-43,-37,-61,-63,-35v-8,8,-13,20,-16,35r79,0"},"\u00ed":{"d":"53,-187r51,0r-39,187r-51,0xm95,-263r54,0r-57,53r-34,0","w":100},"\u00f3":{"d":"139,-263r54,0r-57,53r-34,0xm109,4v-53,0,-86,-31,-87,-82v-2,-66,42,-114,106,-113v54,0,87,32,88,84v0,60,-44,111,-107,111xm111,-35v55,0,82,-116,17,-118v-38,-1,-54,39,-56,75v0,24,15,43,39,43","w":219},"\u00fa":{"d":"147,-263r54,0r-57,53r-33,0xm142,-25v-35,40,-117,44,-117,-19v0,-43,20,-100,28,-143r51,0r-28,136v11,41,65,4,71,-20v8,-33,17,-80,25,-116r51,0r-39,187r-47,0","w":219},"\u00c1":{"d":"193,-325r54,0r-57,52r-34,0xm184,-57r-103,0r-31,57r-54,0r146,-258r59,0r41,258r-50,0xm177,-100r-15,-104r-62,104r77,0","w":259},"\u00cd":{"d":"109,-325r53,0r-57,52r-33,0xm12,0r54,-258r53,0r-53,258r-54,0","w":100},"\u00d3":{"d":"204,-325r54,0r-57,52r-34,0xm137,5v-66,0,-106,-44,-106,-106v0,-91,50,-159,145,-161v62,-1,108,44,106,108v-3,88,-55,159,-145,159xm171,-218v-53,-1,-87,63,-87,116v0,35,24,63,59,62v54,-2,83,-59,86,-113v1,-37,-23,-64,-58,-65","w":280},"\u00da":{"d":"176,-325r54,0r-57,52r-34,0xm225,-49v-33,80,-215,69,-191,-41r35,-168r53,0r-37,183v-3,34,49,45,75,28v23,-15,25,-32,33,-70r30,-141r52,0v-16,66,-28,154,-50,209","w":259},"\u0160":{"d":"157,-295r31,-31r41,0r-52,53r-47,0r-22,-53r35,0xm208,-123v48,55,-9,132,-84,127v-60,-4,-103,-25,-101,-87r50,-3v2,36,15,43,51,46v38,3,66,-29,40,-51v-32,-27,-110,-33,-110,-96v0,-76,112,-95,162,-54v17,14,25,33,27,57r-50,2v5,-43,-85,-54,-88,-11v4,26,19,25,47,39v29,14,48,23,56,31","w":240},"\u0161":{"d":"126,-232r31,-31r41,0r-52,53r-47,0r-21,-53r34,0xm168,-96v46,42,-6,100,-68,100v-52,0,-81,-19,-92,-56r49,-8v8,19,17,27,42,28v20,1,44,-12,31,-29v-37,-23,-94,-21,-94,-70v0,-76,153,-82,163,-11r-47,8v-4,-25,-69,-32,-69,-5v0,25,76,26,85,43"},"\u017d":{"d":"151,-295r31,-31r41,0r-52,53r-47,0r-21,-53r34,0xm9,0r8,-41r149,-174r-120,0r9,-43r185,0r-7,41r-150,175r135,-1r-9,43r-200,0","w":219},"\u017e":{"d":"118,-232r31,-31r41,0r-52,53r-47,0r-22,-53r35,0xm6,0r7,-34r102,-113r-83,0r8,-40r147,0r-6,30r-104,116r90,0r-8,41r-153,0","w":180},"\u00dd":{"d":"183,-325r54,0r-57,52r-34,0xm144,0r-53,0r21,-100r-71,-158r57,0r47,111v23,-38,52,-73,76,-111r61,0r-118,163","w":240},"\u00fd":{"d":"134,-263r54,0r-57,53r-34,0xm30,-187r50,0r18,144v18,-49,48,-99,72,-144r53,0r-137,241v-15,22,-52,28,-84,16r5,-37v29,7,42,-4,56,-33"},"\u010c":{"d":"174,-294r31,-31r42,0r-53,53r-47,0r-21,-53r35,0xm138,-40v34,0,54,-24,63,-53r54,8v-17,52,-57,90,-120,90v-66,0,-101,-43,-101,-112v0,-113,112,-198,204,-133v19,13,27,35,30,61r-50,5v-6,-27,-20,-42,-49,-42v-56,0,-80,57,-83,111v-1,38,19,65,52,65","w":259},"\u010d":{"d":"136,-232r31,-31r41,0r-52,53r-47,0r-21,-53r35,0xm72,-70v0,55,62,35,69,0r49,8v-14,39,-44,65,-91,66v-48,1,-77,-31,-77,-79v0,-88,90,-148,159,-99v14,10,20,27,22,46r-48,5v-1,-19,-12,-31,-30,-31v-37,0,-53,44,-53,84"},"\u010e":{"d":"153,-295r31,-31r41,0r-52,53r-47,0r-22,-53r35,0xm139,-258v149,-25,144,170,66,232v-38,30,-118,25,-189,26r54,-258r69,0xm208,-152v3,-59,-33,-67,-94,-63r-37,174v93,10,127,-33,131,-111","w":259},"\u010f":{"d":"262,-258r46,0v-9,45,-15,95,-66,95r5,-21v16,-5,22,-13,27,-30r-21,0xm21,-74v0,-56,37,-119,93,-117v25,0,43,10,56,30r20,-97r51,0r-54,258r-48,0r4,-20v-39,46,-122,23,-122,-54xm121,-154v-49,0,-77,116,-16,121v54,1,75,-114,16,-121","w":266},"\u011a":{"d":"164,-295r31,-31r42,0r-52,53r-48,0r-21,-53r35,0xm15,0r54,-258r191,0r-9,43r-138,0r-13,59r134,0r-9,43r-134,0r-16,70r150,0r-9,43r-201,0","w":240},"\u011b":{"d":"127,-232r31,-31r42,0r-52,53r-47,0r-22,-53r35,0xm125,-191v59,0,86,54,71,113r-126,0v-9,47,58,64,75,20r45,8v-15,32,-42,54,-84,54v-50,1,-85,-35,-85,-86v0,-61,43,-109,104,-109xm154,-108v6,-43,-37,-61,-63,-35v-8,8,-13,20,-16,35r79,0"},"\u0147":{"d":"173,-295r31,-31r41,0r-52,53r-47,0r-21,-53r34,0xm221,0r-50,0r-69,-173r-36,173r-50,0r54,-258r50,0r69,173r36,-173r50,0","w":259},"\u0148":{"d":"142,-232r31,-31r41,0r-52,53r-47,0r-22,-53r35,0xm157,-106v18,-44,-12,-60,-42,-40v-36,24,-34,96,-49,146r-51,0r39,-187r48,0r-5,25v29,-35,119,-45,116,19v-2,43,-20,99,-28,143r-50,0","w":219},"\u0158":{"d":"160,-295r31,-31r41,0r-52,53r-47,0r-21,-53r34,0xm267,-190v-2,48,-30,75,-79,80v27,30,36,59,58,110r-57,0v-15,-23,-23,-113,-76,-107r-22,0r-22,107r-53,0r54,-258v86,4,201,-23,197,68xm214,-189v1,-37,-62,-23,-100,-26r-15,70v59,0,113,5,115,-44","w":259},"\u0159":{"d":"115,-232r31,-31r41,0r-52,53r-47,0r-22,-53r35,0xm51,-187r47,0r-8,37v25,-34,43,-50,81,-36r-20,42v-72,-15,-74,81,-89,144r-50,0","w":140},"\u0164":{"d":"157,-295r31,-31r42,0r-52,53r-48,0r-21,-53r35,0xm127,0r-53,0r45,-215r-76,0r9,-43r203,0r-9,43r-74,0","w":219},"\u0165":{"d":"169,-258r45,0v-8,46,-15,95,-65,95r4,-21v17,-5,23,-12,27,-30r-21,0xm108,2v-38,6,-80,1,-78,-36v2,-29,16,-84,22,-115r-24,0r7,-38r25,0r6,-30r58,-34r-14,64r31,0r-8,38r-31,0r-20,102v1,16,15,14,33,11","w":172},"\u016e":{"d":"172,-258v-17,0,-34,-17,-34,-34v0,-17,17,-34,34,-34v17,0,34,17,34,34v0,17,-17,34,-34,34xm172,-307v-8,-1,-15,7,-15,15v0,8,8,15,15,15v18,0,19,-30,0,-30xm225,-49v-33,80,-215,69,-191,-41r35,-168r53,0r-37,183v-3,34,49,45,75,28v23,-15,25,-32,33,-70r30,-141r52,0v-16,66,-28,154,-50,209","w":259},"\u016f":{"d":"146,-204v-18,0,-34,-16,-34,-33v0,-17,17,-34,34,-34v17,0,34,17,34,34v0,17,-16,33,-34,33xm146,-252v-8,0,-15,7,-15,15v0,8,7,14,15,14v8,0,15,-7,15,-14v0,-7,-7,-15,-15,-15xm142,-25v-35,40,-117,44,-117,-19v0,-43,20,-100,28,-143r51,0r-28,136v11,41,65,4,71,-20v8,-33,17,-80,25,-116r51,0r-39,187r-47,0","w":219}}});


var defhei = 2; //číslice ve jménu předdefinované třídy (název třídy font_2)
var minhei = 1; //číslice ve jménu třídy s největším písmem
var maxhei = 3; //číslice ve jménu třídy s nejmenším písmem
var hei = defhei; //přednastavená hodnota
var loaded = false;
var bd = new Object();

switchFontSize = function(val) {
	nowheigh = hei;
	switch(val) {
		case 'inc':
			if (nowheigh < maxhei) {
				hei = nowheigh + 1;
		    for(var i = minhei; i <= maxhei; i++) $(bd).removeClass("font_" + i);
		    jQuery(bd).addClass("font_" + hei);
				createCookie('fxfont', hei, 30);
			}
		break;
		case 'dec':
			if (nowheigh > minhei) {
				hei = nowheigh - 1;
		    for(var i = minhei; i <= maxhei; i++) jQuery(bd).removeClass("font_" + i);
		    jQuery(bd).addClass("font_" + hei);
				createCookie('fxfont', hei, 30);
			}
		break;
	}
	setColorB(hei);
	loaded = true;
}

function setColorB(hei) {
	if (hei == defhei) {
		jQuery('#fx-fontdecr').removeClass("disabled");
		jQuery('#fx-fontincr').removeClass("disabled");
	} else if (hei == maxhei) {
		jQuery('#fx-fontdecr').removeClass("disabled");
		jQuery('#fx-fontincr').addClass("disabled");
	} else if (hei == minhei) {
		jQuery('#fx-fontdecr').addClass("disabled");
		jQuery('#fx-fontincr').removeClass("disabled");
	} else {
		jQuery('#fx-fontdecr').removeClass("disabled");
		jQuery('#fx-fontincr').removeClass("disabled");
	}
}

function createCookie(c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie = c_name + "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+"; path=/";
}

function readCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) { 
      c_start = c_start + c_name.length + 1; 
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) c_end = document.cookie.length;
	    if ((document.cookie.substring(c_start,c_end) < minhei) || (document.cookie.substring(c_start,c_end) > maxhei)) return false;
	    return parseInt(unescape(document.cookie.substring(c_start, c_end))) ;
    } 
  }
  return false;
}

function setUserOptions() {
	if (!loaded) {
		cookie = readCookie("fxfont");
		hei = cookie ? cookie : defhei;
		
		bd = jQuery("#content");
		for(var i = minhei; i <= maxhei; i++) jQuery(bd).removeClass("font_" + i);
		
		jQuery(bd).addClass("font_" + hei);
		setColorB(hei);
		loaded = true;
	}
}

jQuery(document).ready(function() {
  
  // search
  jQuery("#search .button").click(function() {
    if(jQuery(this).val() == 'Co hledáte?') jQuery(this).val('');
  }).blur(function() {
    if(jQuery(this).val() == '') jQuery(this).val('Co hledáte?');
  });
  
  // gallery slider
  jQuery(".gallery").serialScroll({
		target: '.thumbs',
	  items: 'li',
		prev: '.pages li.prev a',
		next: '.pages li.next a',
		offset: 0,
		start: 0,
		step: 6,
		duration: 800,
		force: true,
		stop: true,
		lock: false,
		cycle: false,
		navCounter: '.pages .actual'
	});
	
	// show big image from thumb
	jQuery(".gallery .thumbs a").click(function() {
	  jQuery(this).parents(".thumbs").find("li span").remove();
    jQuery(this).parents(".gallery").find(".main img").attr("src", jQuery(this).attr("href"));
    jQuery(this).parents(".gallery").find(".main .info").text(jQuery(this).attr("title"));
	jQuery(this).parents(".gallery").find(".main img").attr("title", jQuery(this).attr("title"));
    jQuery(this).find("img").after("<span></span>");
    return false;
  });
  
  /*
  // share box
  jQuery(".share").click(function() {
    var position = jQuery(this).offset();
    jQuery(".shareBox").remove();

    // structure
    jQuery("body").append('<div class="shareBox"><div class="head"></div><div class="content"><div class="in"><h3 class="h">Share this on:</h3><ul><li class="facebook"><a href="">Facebook</a></li><li class="facebook"><a href="">Twitter</a></li><li class="facebook"><a href="">del.icio.us</a></li></ul><a href="#" class="close overlaid">Close<span></span></a></div></div><div class="bottom"></div></div>');
    
    // position
    jQuery(".shareBox").css({ top: position.top - 20, left: (position.left + jQuery(".shareBox").width()) });
    
    // close
    jQuery(".shareBox .close").click(function() { jQuery(".shareBox").remove(); return false; });
    return false;
  });*/
  
   // font resize
  setUserOptions();
  jQuery("#fx-fontdecr").click(function() {
    switchFontSize('dec');
    return false;
  });
  jQuery("#fx-fontincr").click(function() {
    switchFontSize('inc');
    return false;
  });
  
  // Cufon
  Cufon.replace("#logo")(".h")("h2.head"); 
  
  // overlays
  jQuery(".displayOverlay a").click(function() {
    var offset = jQuery(this).offset();    
    var clone = jQuery(this).parents(".displayOverlay").find(".overlay").clone();
    jQuery(".activeOverlay").remove();
    jQuery(clone).appendTo("#view").css({ top: offset.top, left: offset.left }).addClass("activeOverlay").show();
    return false;
  });
  
  // zruseni overlay
  jQuery("body").click(function(e) {
    var remove = true;
    if(document.all) e = event;
    if(e.target) source = e.target;
    else if(e.srcElement) source = e.srcElement;
    if(source.nodeType == 3) source = source.parentNode;
    
    if(jQuery(source).parents("div").hasClass("overlay")) remove = false;
    if(jQuery(source).hasClass("overlay")) remove = false;
    if(remove) jQuery(".activeOverlay").remove();
  });
});

var months = "leden,únor,březen,duben,květen,červen,červenec,srpen,září,říjen,listopad,prosinec".split(",");
var days   = "Ne,Po,Út,St,Čt,Pá,So,Ne".split(",");	

function checks(el){
	val = el.value;
	if (val.length == 0) {return true;}
	var d2,reg2;
	reg2  = new RegExp("^[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{4}$","");
	d2    = val;
	if (reg2.test(d2))
		{
		d2=d2.split(".");
		d2[1]=d2[1]*1-1;
		nd = new Date(d2[2],d2[1],d2[0]);
		d  = nd.getDate();
		m  = nd.getMonth() + 1;
		y  = nd.getFullYear();
		if (nd) {el.value = d + '.' + m + '.' + y;return;}
		else {
			el.value = "";
			alert("Špatné datum!");
			return;
		}
	}
	else {
		el.value = "";
		alert("Špatné datum!");
		return;
	}
}
function objGet(x,doc)	{var d=(doc)?doc:document; return (d.getElementById?d.getElementById(x):d.all?d.all[x]:d.layers?d.layers[x]:null);}

function decY(x)	{
	return x-1;
}
function incY(x)	{
	return x+1;
}
function d_from_MD(x,y)	{
	if (x == 0){
		return new Date(y-1,11,1);
	}
	return new Date(y,x-1,1);
}
function d_from_MI(x,y)	{
	if (x == 11){
		return new Date(y+1,0,1);
	}
	return new Date(y,x+1,1);
}

function calendar(xName,xFrom,xTo)
{
	this.eu      = 1;	// 0/1 bez funkce, zatim
	this.days    = days; //"Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun".split(",");
	this.months  = months; //"January,February,March,April,May,June,July,August,September,October,November,December".split(",");
	this.nameCal = xName;
	this.objCal  = xFrom;
	this.objTo   = xTo;
	this.putDate = function(y,m,d)	{this.objTo.value = d+"."+(m*1+1)+"."+y; this.close();}
	this.fromDate= fromDate;
	this.open    = calendarWrite;
	this.close   = function()	{this.objCal.innerHTML = "";}
}

function fromDate()
{
var d,reg;
reg  = new RegExp("[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{4}","");
d    = this.objTo.value;
if (reg.test(d))
	{
	d=d.split(".");
	d[1]=d[1]*1-1;
	if (new Date(d[2],d[1],d[0])) {return new Date(d[2],d[1],d[0]);}
	}
return new Date();
}

function calendarWrite(date)
{
var a,d,d0,d2,m,m0,m1,m2,x,y,y2,w,w0, cal,i,j,days,s1,s2,days2,dateT;
a  = this.nameCal;
if (date==null)	{date = this.fromDate();}
dateT = new Date();
d2 = dateT.getDate();
m2 = dateT.getMonth();
y2 = dateT.getFullYear();
d  = date.getDate();
m  = date.getMonth();
y  = date.getFullYear();
x  = ((y2-y)==0 && (m2-m)==0) ? 1 : 0;
m0 = new Date(y,m,  1);
m1 = new Date(y,m+1,1);
w0 = m0.getDay();
w0 = ((w0-this.eu)<0) ? 6 : w0-this.eu;
days = Math.round((m1.getTime()-m0.getTime())/86400000);	//1000*60*60*24

pomY = ""
pomY += "&nbsp;";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/prev_year.gif\" onclick=\""+a+".open(new Date(decY("+y+"),"+m+",1))\" \/>";
pomY += "&nbsp;";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/prev_month.gif\" onclick=\""+a+".open(new Date(d_from_MD("+m+","+y+")))\" \/>";
pomY += "</td><td colspan=\"3\" style=\"border-left:none;border-right:none;padding:7px 0px 0px 0px;\">";
pomY += this.months[m];
pomY += "&nbsp;";
pomY += y;
pomY += "<br>";
pomY += "<span style=\"cursor:pointer;text-decoration:underline;\" onclick=\""+a+".putDate("+y2+","+m2+","+d2+")\">";
pomY += "Dnes";
pomY += "<\/span>";
pomY += "</td><td colspan=\"2\" style=\"border-left:none;\">";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/next_month.gif\" onclick=\""+a+".open(new Date(d_from_MI("+m+","+y+")))\" \/>";
pomY += "&nbsp;";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/next_year.gif\" onclick=\""+a+".open(new Date(incY("+y+"),"+m+",1))\" \/>";
pomY += "<br>";
pomM = pomY;

s1 = pomM

days2 = "\n<tr>";
for (i=0;i<7;i++)
	{days2+= "\n<td>"+this.days[i+this.eu]+"<\/td>";}	//nazvy dnu
days2+= "<\/tr>";

cal = "";
//cal+= s1;
cal+= "\n<table>";
cal+= "\n<thead align=\"center\" bgcolor=\"#eeeeee\">";
cal+= "<tr><td colspan=\"2\" style=\"border-right:none;\">"+s1+"<\/td><\/tr>";
cal+= days2+"\n<\/thead>";
cal+= "\n<tbody align=\"center\">";
cal+= "\n<tr>";

for (i=0;i<w0;i++)
	{cal+= "<td>&nbsp;<\/td>";}				//prazdne dny
w = w0;
for (i=1;i<=days;i++)
	{
	w%=7;
	if (w==0) {cal+= "<\/tr><tr>";}
	j = (x && i==d2) ? "<i>"+i+"<\/i>" : i;
	j = (i==d) ? "<u>"+j+"<\/u>" : j;
	cal+= "\n<td onclick=\""+a+".putDate("+y+","+m+","+i+")\">"+j+"<\/td>";//Y-m-d
	w++;
	}
for (i=0;i<7-w;i++)
	{cal+= "<td>&nbsp;<\/td>";}	
cal+= "<\/tr>";
cal+= "\n<\/tbody>";
cal+= "\n<\/table>";

this.objCal.innerHTML = cal;
}
function init(div_id,text_field_id,myvar){
	ob = objGet(div_id);
	if (ob.innerHTML.length > 0) {
		ob.innerHTML = "";
	}
	else {
		window[myvar] = new calendar(myvar, objGet(div_id), objGet(text_field_id));
		window[myvar].open();
	}
}


/*
 * jqModal - Minimalist Modaling with jQuery
 *   (http://dev.iceburg.net/jquery/jqModal/)
 *
 * Copyright (c) 2007,2008 Brice Burgess <bhb@iceburg.net>
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * $Version: 03/01/2009 +r14
 */
(function($) {
$.fn.jqm=function(o){
var p={
overlay: 50,
overlayClass: 'jqmOverlay',
closeClass: 'jqmClose',
trigger: '.jqModal',
ajax: F,
ajaxText: '',
target: F,
modal: F,
toTop: F,
onShow: F,
onHide: F,
onLoad: F
};
return this.each(function(){if(this._jqm)return H[this._jqm].c=$.extend({},H[this._jqm].c,o);s++;this._jqm=s;
H[s]={c:$.extend(p,$.jqm.params,o),a:F,w:$(this).addClass('jqmID'+s),s:s};
if(p.trigger)$(this).jqmAddTrigger(p.trigger);
});};

$.fn.jqmAddClose=function(e){return hs(this,e,'jqmHide');};
$.fn.jqmAddTrigger=function(e){return hs(this,e,'jqmShow');};
$.fn.jqmShow=function(t){return this.each(function(){t=t||window.event;$.jqm.open(this._jqm,t);});};
$.fn.jqmHide=function(t){return this.each(function(){t=t||window.event;$.jqm.close(this._jqm,t)});};

$.jqm = {
hash:{},
open:function(s,t){var h=H[s],c=h.c,cc='.'+c.closeClass,z=(parseInt(h.w.css('z-index'))),z=(z>0)?z:3000,o=$('<div></div>').css({height:'100%',width:'100%',position:'fixed',left:0,top:0,'z-index':z-1,opacity:c.overlay/100});if(h.a)return F;h.t=t;h.a=true;h.w.css('z-index',z);
 if(c.modal) {if(!A[0])L('bind');A.push(s);}
 else if(c.overlay > 0)h.w.jqmAddClose(o);
 else o=F;

 h.o=(o)?o.addClass(c.overlayClass).prependTo('body'):F;
 if(ie6){$('html,body').css({height:'100%',width:'100%'});if(o){o=o.css({position:'absolute'})[0];for(var y in {Top:1,Left:1})o.style.setExpression(y.toLowerCase(),"(_=(document.documentElement.scroll"+y+" || document.body.scroll"+y+"))+'px'");}}

 if(c.ajax) {var r=c.target||h.w,u=c.ajax,r=(typeof r == 'string')?$(r,h.w):$(r),u=(u.substr(0,1) == '@')?$(t).attr(u.substring(1)):u;
  r.html(c.ajaxText).load(u,function(){if(c.onLoad)c.onLoad.call(this,h);if(cc)h.w.jqmAddClose($(cc,h.w));e(h);});}
 else if(cc)h.w.jqmAddClose($(cc,h.w));

 if(c.toTop&&h.o)h.w.before('<span id="jqmP'+h.w[0]._jqm+'"></span>').insertAfter(h.o);	
 (c.onShow)?c.onShow(h):h.w.show();e(h);return F;
},
close:function(s){var h=H[s];if(!h.a)return F;h.a=F;
 if(A[0]){A.pop();if(!A[0])L('unbind');}
 if(h.c.toTop&&h.o)$('#jqmP'+h.w[0]._jqm).after(h.w).remove();
 if(h.c.onHide)h.c.onHide(h);else{h.w.hide();if(h.o)h.o.remove();} return F;
},
params:{}};
var s=0,H=$.jqm.hash,A=[],ie6=$.browser.msie&&($.browser.version == "6.0"),F=false,
i=$('<iframe src="javascript:false;document.write(\'\');" class="jqm"></iframe>').css({opacity:0}),
e=function(h){if(ie6)if(h.o)h.o.html('<p style="width:100%;height:100%"/>').prepend(i);else if(!$('iframe.jqm',h.w)[0])h.w.prepend(i); f(h);},
f=function(h){try{$(':input:visible',h.w)[0].focus();}catch(_){}},
L=function(t){$()[t]("keypress",m)[t]("keydown",m)[t]("mousedown",m);},
m=function(e){var h=H[A[A.length-1]],r=(!$(e.target).parents('.jqmID'+h.s)[0]);if(r)f(h);return !r;},
hs=function(w,t,c){return w.each(function(){var s=this._jqm;$(t).each(function() {
 if(!this[c]){this[c]=[];$(this).click(function(){for(var i in {jqmShow:1,jqmHide:1})for(var s in this[i])if(H[this[i][s]])H[this[i][s]].w[i](this);return F;});}this[c].push(s);});});};
})(jQuery);