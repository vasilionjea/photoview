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
