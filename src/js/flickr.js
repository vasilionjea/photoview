/**
 * Flickr API Wrapper
 */
(function(window) {
  'use strict';

  var app = window.app,
  _ = app._,
  http = app.http,

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

      return http.get({
        url: _buildPhotosUrl(params)
      }).then(
        this._onFetchSuccess.bind(this, params.success),
        this._onFetchError.bind(this, params.error)
      );
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
