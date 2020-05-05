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
    this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, 4);
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

      attribute vec2 aVertex;
      attribute vec2 aUV;
      varying vec2 vTex;

      void main(void) {
        gl_Position = vec4(aVertex, 0.0, 1.0);
        vTex = vec2(aUV.s, 1.0 - aUV.t);
      }
    `;
    const vertexShader: WebGLShader = this.webgl.createShader(this.webgl.VERTEX_SHADER) as WebGLShader;
    this.webgl.shaderSource(vertexShader, vertexShaderSource);
    this.webgl.compileShader(vertexShader);

    // Define fragment shader
    const fragmentShaderSource: string = `
      precision mediump float;

      uniform sampler2D sampler0;
      varying vec2 vTex;

      void main(void){
        gl_FragColor = texture2D(sampler0, vTex);
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

    // Create vertex buffer
    const vertexBuffer: WebGLBuffer = this.webgl.createBuffer() as WebGLBuffer;
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, vertexBuffer);
    this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), this.webgl.STATIC_DRAW);

    // Create texture buffer
    const textureBuffer: WebGLBuffer = this.webgl.createBuffer() as WebGLBuffer;
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, textureBuffer);
    this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), this.webgl.STATIC_DRAW);

    const vloc: number = this.webgl.getAttribLocation(program, 'aVertex');
    this.webgl.enableVertexAttribArray(vloc);
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, vertexBuffer);
    this.webgl.vertexAttribPointer(vloc, 2, this.webgl.FLOAT, false, 0, 0);

    const tloc: number = this.webgl.getAttribLocation(program, 'aUV');
    this.webgl.enableVertexAttribArray(tloc);
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, textureBuffer);
    this.webgl.vertexAttribPointer(tloc, 2, this.webgl.FLOAT, false, 0, 0);

    // Creat texture
    const texture: WebGLTexture = this.webgl.createTexture() as WebGLTexture;
    this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);
    this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);
  }
}
