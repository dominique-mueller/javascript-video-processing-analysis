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
  private readonly context: CanvasRenderingContext2D;

  /**
   * Constructor
   */
  constructor(videoElement: HTMLVideoElement, canvasElement?: HTMLCanvasElement) {
    // Save video information
    this.videoElement = videoElement;
    this.videoWidth = this.videoElement.videoWidth;
    this.videoHeight = this.videoElement.videoHeight;

    // Create in-memory canvas
    const actualCanvasElement: HTMLCanvasElement = canvasElement || document.createElement('canvas');
    actualCanvasElement.width = this.videoWidth;
    actualCanvasElement.height = this.videoHeight;

    // Get context
    // Configure all kinds to stuff to get the best possible performance
    this.context = actualCanvasElement.getContext('2d', {
      alpha: false,
    }) as CanvasRenderingContext2D;
    this.context.imageSmoothingEnabled = false;
  }

  /**
   * Render video frame
   */
  public renderVideoFrame(): void {
    this.context.drawImage(this.videoElement, 0, 0, this.videoWidth, this.videoHeight, 0, 0, this.videoWidth, this.videoHeight);
  }

  /**
   * Extract video pixels
   */
  public extractPixels(): Uint8ClampedArray {
    return this.context.getImageData(0, 0, this.videoWidth, this.videoHeight).data;
  }
}
