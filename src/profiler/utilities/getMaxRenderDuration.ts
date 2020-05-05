import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get maximum render duration
 */
export const getMaxRenderDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      Math.max(
        ...profilerResults.map((profilerResult: ProfilerResult): number => {
          return profilerResult.renderDuration;
        }),
      ) * 100,
    ) / 100
  );
};
