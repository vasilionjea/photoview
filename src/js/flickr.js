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
