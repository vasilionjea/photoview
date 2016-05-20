/**
 * Main Module
 */
;(function(window) {
  'use strict';

  var app = window.app,

  // Create a PhotoView instance passing the container and a service
  photos = new app.PhotoView({
    container: '#photography',

    service: new app.Flickr({
      api_key: '7beb137cb24366f1e140a7a50bc771ed',
      per_page: 26
    })
  });

  // Use default method to load photos from Flickr
  photos.load();

  // Load photos via Flickr's search method
  // photos.load({
  //   method: 'flickr.photos.search',
  //   text: 'yosemite'
  // });
}(this));
