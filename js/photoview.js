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
    get: function(options) {
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

  // Single Photo
  PHOTO_URL = {
    pattern: 'https://farm{farm}.staticflickr.com/{server}/{id}_{secret}',
    smallSuffix: '_q.jpg',
    largeSuffix: '_z.jpg'
  },

  // All Photos
  PHOTOS_URL = {
    pattern: 'https://api.flickr.com/services/rest/?method={method}&api_key={api_key}&per_page={per_page}',
    format: '&format=json&nojsoncallback=1',
    
    methods: {
      'flickr.photos.search': '&text={text}',
      'flickr.interestingness.getList': ''      
    },

    defaultParams: {
      api_key: '',
      method: 'flickr.interestingness.getList',
      per_page: 20
    }
  };

  /**
   * Builds the fetch URL for a single photo.
   *
   * @param {Object} photo - The photo object literal
   * @param {String} size - The size
   * @return {String}
   */
  function _buildPhotoUrl(photo, size) {
    var url = _.applyPatterns(PHOTO_URL.pattern.slice(), photo);

    if(size === 'large') {
      url += PHOTO_URL.largeSuffix;
    } else {
      url += PHOTO_URL.smallSuffix;
    }

    return url;
  }

  /**
   * Builds the fetch URL for all photos using a specific Flickr method.
   *
   * @param {Object} params - The values for the query params.
   * @return {String}
   */
  function _buildPhotosUrl(params) {
    var fetchUrl = PHOTOS_URL.pattern + PHOTOS_URL.methods[params.method] + PHOTOS_URL.format;
    return _.applyPatterns(fetchUrl, params);
  }

  /**
   * Flickr Service
   *
   * @param {String} options.api_key - The flickr API key
   * @param {Number} options.per_page - Total number of photos to fetch
   */
  function Flickr(params) {
    this.settings = _.extend({}, params, PHOTOS_URL.defaultParams);
  }

  Flickr.prototype = {
    constructor: Flickr,

    /**
     * Sends an XHR request over to the Flickr API.
     *
     * @param {String} [params.text] - The search term
     * @param {Function} [params.success] - The success callback
     * @param {Function} [params.error] - The error callback
     */
    fetch: function(params) {
      params = _.extend({}, params, this.settings);

      ajax.get({
        url: _buildPhotosUrl(params),
        success: this._onFetchSuccess.bind(this, params.success),
        error: this._onFetchError.bind(this, params.error)
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

      callback && callback(this.getPhotos());
    },

    /**
     * @private
     * @param {Function} callback - The callback to execute after a failed search
     * @param {Number} status - The HTTP status code
     */
    _onFetchError: function(callback, status) {
      callback && callback(status);
      // debugger;
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
          smallUrl: _buildPhotoUrl(photo, 'small'),
          largeUrl: _buildPhotoUrl(photo, 'large')
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
 * creates, updates, and handles the UI layer for the component.
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
    var tpl = '<div class="photo-view-backdrop" aria-hidden="true"></div>';

    tpl += '<aside class="photo-view">';
      tpl += '<div class="inner">';
        tpl += '<figure></figure>';
        tpl += '<button class="nav-btn prev" title="Previous photo"></button>';
        tpl += '<button class="nav-btn next" title="Next photo"></button>';
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

    // Navigation related
    this._currentIndex = null;

    // Elements
    this.ui.container = _.$(this.settings.container);

    // Templates
    this.templates.smallPhoto = _smallPhotoTemplate();
    this.templates.photoView = _photoViewTemplate();

    // DOM events
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

    load: function(opts) {
      var params = opts || {};
      params.success = this._render.bind(this);

      this.service.fetch(params);
    },

    /**
     * Constructs the HTML for the whole component, including 
     * all the small photos in the grid.
     *
     * @private
     * @return {String}
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
     * Inserts the component's HTML into the DOM and displays the UI
     * @private
     */
    _render: function(photos) {
      this.ui.container.insertAdjacentHTML('beforeend', this._buildHtml(photos));

      // Reference UI elements that were just appended
      this.ui.backdrop = _.$('.photo-view-backdrop', this.ui.container);
      this.ui.photoView = _.$('.photo-view', this.ui.container);
      this.ui.largePhoto = _.$('figure', this.ui.photoView);
    },

    /**
     * Handles click event for the small images, 
     * large image, and navigation buttons.
     *
     * @private
     */
    _attachEvents: function() {
      this.ui.container.addEventListener('click', function(e) {
        var elem = e.target,
          grandParent = elem.parentNode.parentNode,
          photo;

        // If the large photo was clicked, close it
        if(elem.classList.contains('large-photo')) {
          this.close();
          return;
        }

        // If the prev or next button was clicked, navigate
        if(elem.classList.contains('nav-btn')) {
          elem.classList.contains('prev') && this.prev();
          elem.classList.contains('next') && this.next();
          return;
        }

        // If a small photo was clicked, open its larger equivalent
        if(grandParent.classList.contains('photo')) {
          photo = this.service.getPhoto(parseInt(grandParent.dataset.index, 10));

          if(photo) {
            this.open(photo);
          }
        }
      }.bind(this), false);
    },

    /**
     * Displays a single large photo into the photoview box
     * @param {Object} photo
     * @private
     */
    _show: function(photo) {
      if(!photo) { return; }

      this.ui.largePhoto.innerHTML = _.applyPatterns(_largePhotoTemplate(), photo);
      this._currentIndex = photo.index; 
    },

    /**
     * Opens the large photo view for a single photo
     * @param {Object} photo
     */
    open: function(photo) {
      this._show(photo);

      // Show UI
      document.body.classList.add('photo-view-open');
      this.ui.backdrop.classList.add('visible');
      this.ui.photoView.classList.add('visible');
    },

    /**
     * Closes the large photo view
     */
    close: function() {
      // Empty large photo
      this.ui.largePhoto.innerHTML = '';

      // Hide UI
      document.body.classList.remove('photo-view-open');
      this.ui.backdrop.classList.remove('visible');
      this.ui.photoView.classList.remove('visible');
    },

    /**
     * While the large photo view is open, it shows the next large image
     */
    prev: function() {
      this._show(this.service.getPhoto(this._currentIndex - 1));
    },

    /**
     * While the large photo view is open, it shows the previous large image
     */
    next: function() {
      this._show(this.service.getPhoto(this._currentIndex + 1));
    }
  };

  // Expose to app
  app.PhotoView = PhotoView;
}(this));
