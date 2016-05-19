/**
 * Ajax Module
 */
(function(window) {
  'use strict';

  // App
  window.app = window.app || {};

  // Ajax 
  window.app.ajax = {
    /**
     * Fetches a resource via XHR
     *
     * @param {String} options.url The URL to fetch from
     * @param {Boolean} options.cache Set cache to false when wanting new request on every fetch
     */
    fetch: function(options) {
      var xhr,
        url = options.url;

      // Bypass cache by adding timestamp at the end of the url
      if(options.cache === false) {
        url = url + ((/\?/).test(url) ? '&' : '?') + (+(new Date()));
      }

      // Only modern Browsers please!
      if(window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        throw new Error('Your browser doesn\'t support the XMLHttpRequest object!');
      }

      // Set handler to process server's response
      xhr.addEventListener('readystatechange', function() {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            options.success(xhr.responseText, xhr.status, xhr.statusText);
          } else {
            options.error(xhr.status, xhr.statusText);
          }
        }
      }, false);

      // Open connection and send request
      xhr.open('GET', url, true);
      xhr.send(null);
    }
  };
}(this));
