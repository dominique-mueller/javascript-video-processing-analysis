import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get maximum duration
 */
export const getMinDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      Math.min(
        ...profilerResults.map((profilerResult: ProfilerResult): number => {
          return profilerResult.renderDuration + profilerResult.extractDuration;
        }),
      ) * 100,
    ) / 100
  );
};
