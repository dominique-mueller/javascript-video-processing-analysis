import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get maximum extract duration
 */
export const getMinExtractDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      Math.min(
        ...profilerResults.map((profilerResult: ProfilerResult): number => {
          return profilerResult.extractDuration;
        }),
      ) * 100,
    ) / 100
  );
};
