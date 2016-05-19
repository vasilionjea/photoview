/**
 * Main Module
 */
;(function(window) {
  'use strict';

  var app = window.app;

  window.photos = new app.PhotoView({
    container: '#photography',

    service: new app.Flickr({
      api_key: '7beb137cb24366f1e140a7a50bc771ed',
      per_page: 34
    })
  });

  window.photos.load('zion');

  // re-render with new photos
  // photos.load('yosemite');
}(this));
