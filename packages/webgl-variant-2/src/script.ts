// https://stackoverflow.com/questions/12250953/drawing-an-image-using-webgl

// Get elements
const videoElement: HTMLVideoElement = document.getElementById('video') as HTMLVideoElement;

// Create in-memory canvas
// const inMemoryCanvasElement: HTMLCanvasElement = document.createElement('canvas');
const inMemoryCanvasElement: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
inMemoryCanvasElement.width = 1920;
inMemoryCanvasElement.height = 1080;
const inMemoryCanvasContext: WebGL2RenderingContext = inMemoryCanvasElement.getContext('webgl2', {
  alpha: false,
  antialias: false,
  depth: false,
  powerPreference: 'high-performance',
  premultipliedAlpha: false,
}) as WebGL2RenderingContext;

const setupWebGLTexture = (webgl: WebGL2RenderingContext): WebGLTexture => {
  // Define vertex shader
  const vertexShaderSource: string = `
    precision mediump float;

    attribute vec2 a_position;
    uniform mat3 u_matrix;
    varying vec2 v_texCoord;

    void main() {
      gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);
      v_texCoord = a_position;
    }
  `;
  const vertexShader: WebGLShader = webgl.createShader(webgl.VERTEX_SHADER) as WebGLShader;
  webgl.shaderSource(vertexShader, vertexShaderSource);
  webgl.compileShader(vertexShader);

  // Define fragment shader
  const fragmentShaderSource: string = `
    precision mediump float;

    uniform sampler2D u_image;
    varying vec2 v_texCoord;

    void main() {
      gl_FragColor = texture2D(u_image, v_texCoord);
    }
  `;
  const fragmentShader: WebGLShader = webgl.createShader(webgl.FRAGMENT_SHADER) as WebGLShader;
  webgl.shaderSource(fragmentShader, fragmentShaderSource);
  webgl.compileShader(fragmentShader);

  // Create program
  const program = webgl.createProgram() as WebGLProgram;
  webgl.attachShader(program, vertexShader);
  webgl.attachShader(program, fragmentShader);
  webgl.linkProgram(program);
  webgl.useProgram(program);

  // Disable depth test
  webgl.disable(webgl.DEPTH_TEST);

  // Turn off rendering to alpha
  webgl.colorMask(true, true, true, false);

  // Provide texture coordinates for the rectangle
  const positionBuffer: WebGLBuffer = webgl.createBuffer() as WebGLBuffer;
  webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), webgl.STATIC_DRAW);
  const positionLocation: number = webgl.getAttribLocation(program, 'a_position');
  webgl.enableVertexAttribArray(positionLocation);
  webgl.vertexAttribPointer(positionLocation, 2, webgl.FLOAT, false, 0, 0);

  // Build a matrix that will stretch our unit quad to our desired size and location
  const u_matrixLoc: WebGLUniformLocation = webgl.getUniformLocation(program, 'u_matrix') as WebGLUniformLocation;
  webgl.uniformMatrix3fv(u_matrixLoc, false, [2, 0, 0, 0, -2, 0, -1, 1, 1]);

  // Creat texture
  const texture: WebGLTexture = webgl.createTexture() as WebGLTexture;
  webgl.bindTexture(webgl.TEXTURE_2D, texture);
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);

  // Done
  return texture;
};

const renderVideoToCanvas = (webgl: WebGL2RenderingContext, videoElement: HTMLVideoElement): void => {
  webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, videoElement);
  webgl.drawArrays(webgl.TRIANGLES, 0, 6);
};

const readPixelsFromCanvas = (webgl: WebGL2RenderingContext): Uint8Array => {
  const pixels: Uint8Array = new Uint8Array(1920 * 1080 * 4);
  webgl.readPixels(0, 0, 1920, 1080, webgl.RGBA, webgl.UNSIGNED_BYTE, pixels);
  return pixels;
};

// Wait for the video to play
videoElement.addEventListener(
  'play',
  (): void => {
    let performanceProfilerResults: Array<any> = [];

    // Get notified if the video has ended
    let hasVideoEnded: boolean = false;
    videoElement.addEventListener(
      'ended',
      (): void => {
        hasVideoEnded = true;
      },
      { once: true },
    );

    // WebGL setup
    const webglTexture: WebGLTexture = setupWebGLTexture(inMemoryCanvasContext);

    // Render frame
    const renderFrame = (): void => {
      // Start performance profiling
      const before: number = performance.now();

      // Draw the full image into the canvas
      renderVideoToCanvas(inMemoryCanvasContext, videoElement);

      // Get raw image data
      const imageData: Uint8Array = readPixelsFromCanvas(inMemoryCanvasContext);

      // Somehow use the image data (here by assigning it to another variable) to prevent any browser optimizations from breaking things
      const useImageData: number = imageData[0];

      // Stop performance profiling
      const after: number = performance.now();

      // Save performance profiling results
      performanceProfilerResults.push({
        timestamp: new Date().toISOString(),
        duration: after - before,
      });

      // Continue or stop
      if (hasVideoEnded) {
        console.log(performanceProfilerResults);
        console.log(
          performanceProfilerResults.reduce((acc, currentValue) => {
            return acc + currentValue.duration;
          }, 0) / performanceProfilerResults.length,
        );
        return;
      } else {
        requestAnimationFrame(renderFrame);
      }
    };

    // Start
    requestAnimationFrame(renderFrame);
  },
  { once: true },
);
