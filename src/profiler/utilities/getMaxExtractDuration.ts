import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get maximum extract duration
 */
export const getMaxExtractDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      Math.max(
        ...profilerResults.map((profilerResult: ProfilerResult): number => {
          return profilerResult.extractDuration;
        }),
      ) * 100,
    ) / 100
  );
};
