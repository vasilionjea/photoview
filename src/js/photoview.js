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
