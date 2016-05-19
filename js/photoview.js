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

/**
 * Flickr API Wrapper
 */
(function(window) {
  'use strict';

  var app = window.app,

  _ = app._,
  ajax = app.ajax,

  PHOTO_URL_PATTERN = 'https://farm{farm}.staticflickr.com/{server}/{id}_{secret}',
  SMALL_URL_SUFFIX = '_q.jpg',
  LARGE_URL_SUFFIX = '_z.jpg',

  API_URL_PATTERN = 'https://api.flickr.com/services/rest/?method={method}&api_key={api_key}&text={text}&per_page={per_page}&format=json&nojsoncallback=1',
  API_URL_PARAMS = {
    api_key: '',
    method: 'flickr.photos.search',
    per_page: 20 
  };

  /**
   * Flickr Service
   *
   * @param {String} options.api_key - The flickr API key
   * @param {Number} options.per_page - Total number of photos to fetch
   */
  function Flickr(params) {
    // Merge defaults with provided params
    this.settings = _.extend({}, params, API_URL_PARAMS);

    // Slice the API_URL_PATTERN to make a copy so we're 
    // not modifying the original one.
    this.url = _.applyPatterns(API_URL_PATTERN.slice(), this.settings);
  }

  Flickr.prototype = {
    constructor: Flickr,

    /**
     * Creates the search URL by applying the search term,
     * and sends the XHR request over to the Flickr API.
     *
     * @param {String} opts.term - The search term
     * @param {Function} opts.success - The success callback
     * @param {Function} opts.error - The error callback
     */
    search: function(opts) {
      // Apply the pattern per serch term.
      var searchUrl = _.applyPatterns(this.url.slice(), {
        text: opts.term
      });

      ajax.fetch({
        url: searchUrl,
        success: this._onFetchSuccess.bind(this, opts.success),
        error: this._onFetchError.bind(this, opts.error)
      });
    },

    /**
     * @private
     * @param {Function} callback - The callback to execute after a succesfull search
     * @param {String} strJson - Then JSON string returned from the server
     * @param {Number} status - The HTTP status code
     */
    _onFetchSuccess: function(callback, strJson, status) {
      var data = JSON.parse(strJson);

      if(data && data.photos && Array.isArray(data.photos.photo)) {
        this._setPhotos(data.photos.photo);
      }

      callback(this.getPhotos());
    },

    /**
     * @private
     * @param {Function} callback - The callback to execute after a failed search
     * @param {Number} status - The HTTP status code
     */
    _onFetchError: function(callback, status) {
      debugger;
    },

    /**
     * @private
     * @param {Object} photo - The photo object literal
     * @param {String} size - The size
     * @return {String}
     */
    _createPhotoUrl: function(photo, size) {
      var url = _.applyPatterns(PHOTO_URL_PATTERN.slice(), photo);

      if(size === 'large') {
        url += LARGE_URL_SUFFIX;
      } else {
        url += SMALL_URL_SUFFIX;
      }

      return url;
    },

    /**
     * Maps the photo objects to simpler objects for our use
     * @private
     * @param {Array} photos - Array of photo objects
     */
    _setPhotos: function(photos) {
      var self = this;
      
      this.photos = photos.map(function(photo, i) {
        return {
          index: i,
          id: photo.id,
          title: photo.title,
          smallUrl: self._createPhotoUrl(photo, 'small'),
          largeUrl: self._createPhotoUrl(photo, 'large')
        };
      });
    },

    /**
     * @return {Array} - Array of photo objects
     */
    getPhotos: function() {
      var photos = [];

      if(this.photos && this.photos.length) {
        photos = this.photos;
      }

      return photos;
    },

    /**
     * @return {Object} - The photo object
     */
    getPhoto: function(idx) {
      return this.photos[idx];
    }
  };

  // Expose to app
  app.Flickr = Flickr;
}(this));

/**
 * PhotoView Module
 *
 * This module fetches photos from the provided photo service (e.g. flickr) and
 * creates, updates, and generally handles the UI layer for the app.
 */
(function(window) {
  'use strict';

  var app = window.app,
  _ = app._;

  /**
   * Template for a small photo in the photo grid
   * @return {String}
   */
  function _smallPhotoTemplate() {
    var tpl = '';

    tpl += '<li class="photo" data-id="{id}" data-index="{index}">';
      tpl += '<figure><img src="{smallUrl}" alt="{title}"></figure>';
    tpl += '</li>';

    return tpl;
  }

  /**
   * Template for the photo view box
   * @return {String}
   */
  function _photoViewTemplate() {
    var tpl = '<div class="photo-view-backdrop hidden" aria-hidden="true"></div>';

    tpl += '<aside class="photo-view hidden">';
      tpl += '<div class="inner">';
        tpl += '<figure></figure>';
        tpl += '<button class="prev" title="Previous photo"></button>';
        tpl += '<button class="next" title="Next photo"></button>';
      tpl += '</div>';
    tpl += '</aside>';

    return tpl;
  }

  /**
   * Template for the large photo in the photo view
   * @return {String}
   */
  function _largePhotoTemplate() {
    var tpl = '';

    tpl += '<img class="large-photo" src="{largeUrl}" alt="{title}">';
    tpl += '<figcaption>{title}</figcaption>';

    return tpl;
  }

  /**
   * PhotoView Constructor
   *
   * @param {String} options.container - Where to insert the generated DOM
   * @param {Object} options.service - The photo service to fetch photos from
   */
  function PhotoView(options) {
    this.settings = options;
    this.service = this.settings.service;

    // Elements & templates
    this.ui.container = _.$(this.settings.container);
    this.templates.smallPhoto = _smallPhotoTemplate();
    this.templates.photoView = _photoViewTemplate();

    // Setup
    this._attachEvents();
  }

  PhotoView.prototype = {
    constructor: PhotoView,

    templates: {
      smallPhoto: null,
      photoView: null
    },

    ui: {
      container: null
    },

    load: function(term) {
      this.service.search({
        term: term,
        success: this._onLoad.bind(this)
      });
    },

    /**
     * @private
     */
    _onLoad: function(photos) {
      this._render(photos);
    },

    /**
     * @private
     */
    _buildHtml: function(photos) {
      var html = this.templates.photoView,
        self = this;

      html += '<ul class="photo-grid">';

      photos.forEach(function(photo) {
        // Make a copy of the template string & apply data
        var tpl = self.templates.smallPhoto.slice();
        html += _.applyPatterns(tpl, photo);
      });

      html += '</ul>';

      return html;
    },

    /**
     * @private
     */
    _render: function(photos) {
      this.ui.container.insertAdjacentHTML('beforeend', this._buildHtml(photos));

      // Reference UI elements that were just appended
      this.ui.photoViewBackdrop = _.$('.photo-view-backdrop', this.ui.container);
      this.ui.photoView = _.$('.photo-view', this.ui.container);
      this.ui.largePhoto = _.$('figure', this.ui.photoView);
    },

    /**
     * @private
     */
    _attachEvents: function() {
      this.ui.container.addEventListener('click', function(e) {
        var elem = e.target.parentNode.parentNode,
          photo;

        // Close
        if(e.target.classList.contains('large-photo')) {
          this.close();
          return;
        }

        if(!elem.classList.contains('photo')) {
          return;
        }

        // Open a new photo
        photo = this.service.getPhoto(parseInt(elem.dataset.index, 10));

        if(photo) {
          this.open(photo);
        }
      }.bind(this), false);
    },

    open: function(photo) {
      // Generate template with data
      this.ui.largePhoto.innerHTML = _.applyPatterns(_largePhotoTemplate(), photo);

      // Show UI
      document.body.classList.add('photo-view-open');
      this.ui.photoViewBackdrop.classList.remove('hidden');
      this.ui.photoView.classList.remove('hidden');
    },

    close: function() {
      // Empty large photo
      this.ui.largePhoto.innerHTML = '';

      // Hide UI
      document.body.classList.remove('photo-view-open');
      this.ui.photoViewBackdrop.classList.add('hidden');
      this.ui.photoView.classList.add('hidden');
    }
  };

  // Expose to app
  app.PhotoView = PhotoView;
}(this));
