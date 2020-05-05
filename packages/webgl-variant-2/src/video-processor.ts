/**
 * Video processor
 */
export class VideoProcessor {
  /**
   * Video element
   */
  private readonly videoElement: HTMLVideoElement;

  /**
   * Width
   */
  private readonly videoWidth: number;

  /**
   * Height
   */
  private readonly videoHeight: number;

  /**
   * Canvas context
   */
  private readonly webgl: WebGL2RenderingContext;

  /**
   * Constructor
   */
  constructor(videoElement: HTMLVideoElement, canvasElement?: HTMLCanvasElement) {
    // Save video information
    this.videoElement = videoElement;
    this.videoWidth = this.videoElement.videoWidth;
    this.videoHeight = this.videoElement.videoHeight;

    // Create in-memory canvas
    const actualCanvasElement: HTMLCanvasElement = canvasElement || (document.createElement('canvas') as HTMLCanvasElement);
    actualCanvasElement.width = this.videoWidth;
    actualCanvasElement.height = this.videoHeight;

    // Get context
    // Configure all kinds to stuff to get the best possible performance
    this.webgl = actualCanvasElement.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext;

    // Setup
    this.setupCanvas();
  }

  /**
   * Render video frame
   */
  public renderVideoFrame(): void {
    this.webgl.texImage2D(this.webgl.TEXTURE_2D, 0, this.webgl.RGBA, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, this.videoElement);
    this.webgl.drawArrays(this.webgl.TRIANGLES, 0, 6);
  }

  /**
   * Extract video pixels
   */
  public extractPixels(): Uint8Array {
    const pixels: Uint8Array = new Uint8Array(this.videoWidth * this.videoHeight * 4);
    this.webgl.readPixels(0, 0, this.videoWidth, this.videoHeight, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, pixels);
    return pixels;
  }

  /**
   * Setup canvas
   */
  private setupCanvas(): void {
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
    const vertexShader: WebGLShader = this.webgl.createShader(this.webgl.VERTEX_SHADER) as WebGLShader;
    this.webgl.shaderSource(vertexShader, vertexShaderSource);
    this.webgl.compileShader(vertexShader);

    // Define fragment shader
    const fragmentShaderSource: string = `
      precision mediump float;

      uniform sampler2D u_image;
      varying vec2 v_texCoord;

      void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
      }
    `;
    const fragmentShader: WebGLShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER) as WebGLShader;
    this.webgl.shaderSource(fragmentShader, fragmentShaderSource);
    this.webgl.compileShader(fragmentShader);

    // Create program
    const program = this.webgl.createProgram() as WebGLProgram;
    this.webgl.attachShader(program, vertexShader);
    this.webgl.attachShader(program, fragmentShader);
    this.webgl.linkProgram(program);
    this.webgl.useProgram(program);

    // Disable depth test
    this.webgl.disable(this.webgl.DEPTH_TEST);

    // Turn off rendering to alpha
    this.webgl.colorMask(true, true, true, false);

    // Provide texture coordinates for the rectangle
    const positionBuffer: WebGLBuffer = this.webgl.createBuffer() as WebGLBuffer;
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, positionBuffer);
    this.webgl.bufferData(
      this.webgl.ARRAY_BUFFER,
      new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
      this.webgl.STATIC_DRAW,
    );
    const positionLocation: number = this.webgl.getAttribLocation(program, 'a_position');
    this.webgl.enableVertexAttribArray(positionLocation);
    this.webgl.vertexAttribPointer(positionLocation, 2, this.webgl.FLOAT, false, 0, 0);

    // Build a matrix that will stretch our unit quad to our desired size and location
    const u_matrixLoc: WebGLUniformLocation = this.webgl.getUniformLocation(program, 'u_matrix') as WebGLUniformLocation;
    this.webgl.uniformMatrix3fv(u_matrixLoc, false, [2, 0, 0, 0, -2, 0, -1, 1, 1]);

    // Creat texture
    const texture: WebGLTexture = this.webgl.createTexture() as WebGLTexture;
    this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);
  }
}
