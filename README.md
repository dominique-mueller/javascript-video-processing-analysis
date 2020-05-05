<div align="center">

# javascript-video-processing-experiment

JavaScript real-time video processing using Canvas.

</div>

<br><br><br>

## TODO

Notes:

- rAF loop
  - timeupdated no reliable
- Video must be in visible screen area, and tab must be active
- createImageBitmap() is very slow (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap)
- WebM instead of e.g. MP4 due to Chromium vs. Chrome (see https://pptr.dev/)
- Weirdly high numbers when running headless

Source:

- URL: http://bbb3d.renderfarming.net/download.html
- Video URL: http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4

// https://stackoverflow.com/questions/12250953/drawing-an-image-using-webgl
// https://stackoverflow.com/questions/9857089/flip-upside-down-vertex-shader-gles
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_textures_in_WebGL

https://emscripten.org/docs/optimizing/Optimizing-WebGL.html
