import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get maximum duration
 */
export const getMaxDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      Math.max(
        ...profilerResults.map((profilerResult: ProfilerResult): number => {
          return profilerResult.renderDuration + profilerResult.extractDuration;
        }),
      ) * 100,
    ) / 100
  );
};
