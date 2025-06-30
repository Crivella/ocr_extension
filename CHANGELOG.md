# Change Log

List of changes between versions

## 0.3.3

- Switching from `DOMNodeInserted` and `DOMNodeRemoved` events to a `MutationObserver` to handle changes in the DOM
  This catches changes in the DOM more reliably (in particular replaceChild calls) and is more performant

## 0.3.2

- Fixed an issue with websites that impose a `text-indent` on the image original class (inherited by the wrapper div and thus the wrapped text)
  EG: some sites use a `.preload` class on the image which has a `text-indent: -9999px` style causing the text to render out of the visible area
  Forcing tha `patch-text` to have a `text-indent: 0` style fixes this issue and should have no side effects on other elements iun the page
  
## 0.3.1

- Added this file
- Added controllable logging instead of just printing everything to console all the time
- Added render option to adjust line-width of textboxes contours

## 0.3.0

### Changes

- Added collapsible field with form to mange installed plugins
- Added warning message for old server version
- Improved UX
  - Show error from server on failed translation and properly unwraps image once script is disabled
  - Show error returned when a form submission fails
- Downgraded Axios version due to vulnerability found in newer versions (should not really be of concern for this but just to be safe)

## 0.2.0

### New features

- Implemented manual translation (tools and endpoints)
- Added possibility to switch between translated and ocr text and also to control the text direction
- Added collapsible fields to the popup
  - Field to control text rendering
  - Field to control Options to be sent to the backend when request translations 

### General improvements

- Improved UI
  - Language names are displayed in human readable format
  - Added dark theme
  - Added theme toggle switch
  - Changes to options are now persistent
