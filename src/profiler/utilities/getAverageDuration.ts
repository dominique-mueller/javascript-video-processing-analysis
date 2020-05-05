import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get average duration
 */
export const getAverageDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      (profilerResults.reduce((completeDuration: number, profilerResult: ProfilerResult): number => {
        return completeDuration + profilerResult.renderDuration + profilerResult.extractDuration;
      }, 0) /
        profilerResults.length) *
        100,
    ) / 100
  );
};
