import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get average render duration
 */
export const getAverageRenderDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    Math.round(
      (profilerResults.reduce((completeDuration: number, profilerResult: ProfilerResult): number => {
        return completeDuration + profilerResult.renderDuration;
      }, 0) /
        profilerResults.length) *
        100,
    ) / 100
  );
};
