# Photoview
A light and modular component to display photos in a navigable popup; a.k.a. "lightbox". Written in plain JavaScript for modern Browsers.

### Features
- Loads photos from a remote service (_e.g. Flickr_).
- Displays photos and navigates through them.
- _more to come..._

### Browsers
  - Latest versions of Chrome, Safari, Firefox and IE (_it may work in others as well, but these were tested_).

### To do
- Provide keyboard navigation; left/right arrow keys, ESC key
- Add close button (_currently a user must click the large image to close it_)
- Add a `LocalService` class that uses an array of photo objects.
- Add support for other services, e.g. Unsplash, 500px.
- Add event emitter so communication between service & UI layer is done more succinctly.
- Add ARIA roles.
- Possibly allow for other types of content to be rendered, e.g. videos and html.
