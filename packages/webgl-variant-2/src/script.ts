import { VideoProcessor } from './video-processor';

// Wait for the video to play
const videoElement: HTMLVideoElement = document.getElementById('video') as HTMLVideoElement;
const canvasElement: HTMLCanvasElement | undefined = (document.getElementById('canvas') as HTMLCanvasElement) || undefined;
videoElement.addEventListener(
  'play',
  (): void => {
    // Create video processor
    const videoProcessor: VideoProcessor = new VideoProcessor(videoElement, canvasElement);

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
    let performanceProfilerResults: Array<any> = [];
    const renderFrame = (): void => {
      // Start performance profiling
      const beforeRender: number = performance.now();
      videoProcessor.renderVideoFrame();
      const afterRender: number = performance.now();
      const renderDuration: number = afterRender - beforeRender;

      // Get raw image data, and somehow use it
      const beforeExtract: number = performance.now();
      const imageData: Uint8Array = videoProcessor.extractPixels();
      const useImageData: number = imageData[0];
      const afterExtract: number = performance.now();
      const extractDuration: number = afterExtract - beforeExtract;

      // Save performance profiling results
      performanceProfilerResults.push({
        timestamp: new Date().toISOString(),
        renderDuration,
        extractDuration,
        duration: renderDuration + extractDuration,
      });

      // Continue or stop
      if (hasVideoEnded) {
        // console.log(performanceProfilerResults);
        console.log(
          'Average render duration',
          performanceProfilerResults.reduce((acc, currentValue) => {
            return acc + currentValue.renderDuration;
          }, 0) / performanceProfilerResults.length,
        );
        console.log(
          'Average extract duration',
          performanceProfilerResults.reduce((acc, currentValue) => {
            return acc + currentValue.extractDuration;
          }, 0) / performanceProfilerResults.length,
        );
        console.log(
          'Average duration',
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
