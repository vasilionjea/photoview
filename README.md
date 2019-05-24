# Photoview

<strong>[<small>Deprecated</small>]</strong>

A light and modular component to display photos in a navigable popup; a.k.a. "lightbox". Written in plain JavaScript for modern Browsers. A working example of this application can be seen at the following URL: http://vasilionjea.github.io/photoview/

### Features
- Loads photos from a remote service (_e.g. Flickr_).
- Displays photos and navigates through them.
- _more to come..._

### Browsers
Latest versions of the following (_it may work in others as well, but these were tested_):
  - Chrome
  - Safari
  - Firefox
  - IE <sup>*</sup>

<sup>*</sup> _IE11 doesn't support the Promise API, so a polyfill is required; here is a simple promise lib you could use: https://github.com/then/promise_

### Local Development
1. First `cd photoview/` and run `npm install`.
2. Then execute `grunt watch` to watch and build files automatically.
3. In a new Terminal tab `cd photoview/` and `grunt connect:dev` to run a NodeJS static server.
4. Open your favorite Browser and go to: <http://localhost:9000>

### To do
- Provide keyboard navigation; left/right arrow keys, ESC key
- Add close button (_currently a user must click the large image to close it_)
- Add a `LocalService` class that uses an array of photo objects.
- Add support for other services, e.g. Unsplash, 500px.
- Add event emitter so communication between service & UI layer is done more succinctly.
- Add ARIA roles.
- Possibly allow for other types of content to be rendered, e.g. videos and html.

### Resources
- https://www.flickr.com/services/api/
- https://www.flickr.com/services/api/misc.urls.html
- https://www.flickr.com/services/developer/api/
