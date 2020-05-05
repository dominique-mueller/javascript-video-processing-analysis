import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get average extract duration
 */
export const getAverageExtractDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      (profilerResults.reduce((completeDuration: number, profilerResult: ProfilerResult): number => {
        return completeDuration + profilerResult.extractDuration;
      }, 0) /
        profilerResults.length) *
        100,
    ) / 100
  );
};
