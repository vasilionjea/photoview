/**
 * Utils Module
 */
(function(window) {
  'use strict';

  // App
  window.app = window.app || {};

  // A collection of general utils
  window.app._ = {
    /**
     * Transforms an iterable object (e.g. Arguments) into an Array
     * @param {Object} obj
     * @return {Array}
     */
    toArray: function(obj) {
      return Array.prototype.slice.call(obj);
    },

    /**
     * Copies properties from source(s) over to the target object
     * - extend(target, source [source, source...N]);
     */
    extend: function() {
      var args = this.toArray(arguments),
        target = args.shift(),
        i = 0,
        len = args.length;

      for(i; i < len; i += 1) {
        Object.keys(args[i]).forEach(function(key) {
          if(!target[key]) {
            target[key] = args[i][key];
          }
        });
      }

      return target;
    },

    /**
     * Queries the DOM for a node based on the provided selector
     *
     * @param {String} selector - The CSS selector
     * @param {Node} context - A context Node to start querying from
     * @return {Node}
     */
    $: function(selector, context) {
      return (context || window.document).querySelector(selector);
    },

    /**
     * Queries the DOM for nodes based on the provided selector
     *
     * @param {String} selector - The CSS selector
     * @param {Node} context - A context Node to start querying from
     * @return {NodeList}
     */
    $$: function(selector, context) {
      return (context || window.document).querySelectorAll(selector);
    },

    /**
     * A string like "Hello, {firstName} {lastName}" becomes "Hello, Alice Smith", when 
     * a data object like this is provided: {firstName: 'Alice', lastName: 'Smith'}
     *
     * @param {String} str - The string containing patterns like `{name}`
     * @param {Object} data - A key-value pair where its keys match with the pattern keys
     *
     * @return {String} The final string with the patterns turned into actual values
     */
    applyPatterns: function(str, data) {
      return str.replace(/\{(\w+)\}/g, function(substringMatch, parenthesisMatch) {
        // Replace with actual value, if the key is present in data
        if(data[parenthesisMatch] !== undefined) {
          return data[parenthesisMatch];
        }

        // Otherwise replace with the original substring pattern
        return substringMatch;
      });
    }
  };
}(this));
