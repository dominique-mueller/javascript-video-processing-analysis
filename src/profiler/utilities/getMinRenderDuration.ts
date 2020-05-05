import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get maximum render duration
 */
export const getMinRenderDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      Math.min(
        ...profilerResults.map((profilerResult: ProfilerResult): number => {
          return profilerResult.renderDuration;
        }),
      ) * 100,
    ) / 100
  );
};
