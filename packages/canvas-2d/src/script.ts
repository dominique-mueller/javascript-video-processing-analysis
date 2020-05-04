// Get elements
const videoElement: HTMLVideoElement = document.getElementById('video') as HTMLVideoElement;

// Create in-memory canvas
const inMemoryCanvasElement: HTMLCanvasElement = document.createElement('canvas');
// const inMemoryCanvasElement: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
inMemoryCanvasElement.width = 1920;
inMemoryCanvasElement.height = 1080;
const inMemoryCanvasContext: CanvasRenderingContext2D = inMemoryCanvasElement.getContext('2d', {
  alpha: false,
}) as CanvasRenderingContext2D;

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

    // Render frame
    const renderFrame = (): void => {
      // Start performance profiling
      const before: number = performance.now();

      // Draw the full image into the canvas
      inMemoryCanvasContext.drawImage(videoElement, 0, 0, 1920, 1080, 0, 0, 1920, 1080);

      // Get raw image data
      const imageData: Uint8ClampedArray = inMemoryCanvasContext.getImageData(0, 0, 1920, 1080).data;

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
