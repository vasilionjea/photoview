/**
 * Ajax Module
 */
(function(window) {
  'use strict';

  // App
  window.app = window.app || {};

  // Utils
  var _ = window.app._;

  // Ajax helper
  function ajax(options) {
    return new Promise(function resolver(resolve, reject) {
      var xhr,
        url = options.url,
        type = options.type,
        data = options.data || null;

      // Only modern Browsers please!
      if(window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        reject('Your browser doesn\'t support the XMLHttpRequest object!');
      }

      // Bypass cache by adding timestamp at the end of the url
      if(options.cache === false) {
        url = url + ((/\?/).test(url) ? '&' : '?') + (+(new Date()));
      }

      // Set handler to process server's response
      xhr.addEventListener('load', function() {
        if(xhr.status === 200) {
          resolve(xhr.responseText, xhr.status, xhr.statusText);
        } else {
          reject(xhr.status, xhr.statusText); 
        }
      }, false);

      // Set handler to process connection error
      xhr.addEventListener('error', function() {
        reject(xhr.status); 
      });

      // Open connection and send request
      xhr.open(type, url, true);
      xhr.send(data);
    });
  }

  // HTTP 
  window.app.http = {
    /**
     * Fetches a resource via XHR
     *
     * @param {String} options.url The URL to fetch from
     * @param {Boolean} options.cache Set cache to false when wanting new request on every fetch
     */
    get: function(options) {
      return ajax(_.extend({ type: 'GET' }, options));
    }
  };
}(this));
