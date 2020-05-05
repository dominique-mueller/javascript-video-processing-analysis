import React, { FunctionComponent, ReactElement } from 'react';

import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';

import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Profiler line chart tooltip
 */
const ProfilerLineChartTooltip: FunctionComponent<{
  active: boolean;
  payload: Array<any>;
  label: string;
}> = ({ active, payload }): ReactElement | null => {
  return active ? (
    <div style={{ backgroundColor: '#FFF', padding: '6px 8px', border: '1px solid #AAA', color: '#285E61', fontSize: '12px' }}>
      Duration: {payload[0].payload.y}ms
      <br />
      Render duration: {payload[0].payload.renderDuration}ms
      <br />
      Extract duration: {payload[0].payload.extractDuration}ms
    </div>
  ) : null;
};

/**
 * Profiler line chart
 */
const ProfilerLineChart: FunctionComponent<{
  profilerResults: Array<ProfilerResult>;
  width: number;
  height: number;
}> = ({ profilerResults, width, height }): ReactElement => {
  // Transform data into chart-compatible format
  const data: Array<any> = profilerResults.map((profilerResult: ProfilerResult) => {
    return {
      x: new Date(profilerResult.timestamp).getTime(),
      y: Math.round((profilerResult.renderDuration + profilerResult.extractDuration) * 100) / 100,
      renderDuration: Math.round(profilerResult.renderDuration * 100) / 100,
      extractDuration: Math.round(profilerResult.extractDuration * 100) / 100,
    };
  });

  // Define chart domain
  const xDomain: [number, number] = [
    new Date(profilerResults[0].timestamp).getTime(),
    new Date(profilerResults[profilerResults.length - 1].timestamp).getTime(),
  ];

  // Render
  return (
    <AreaChart data={data} width={width} height={height} margin={{ top: 16, bottom: 16 }}>
      <XAxis dataKey="x" type="number" domain={xDomain} tick={false} />
      <YAxis dataKey="y" type="number" unit="ms" width={64} tick={{ fontSize: '12px', fill: '#285E61' }} tickSize={12} />
      <CartesianGrid strokeDasharray="2 3" />
      <Tooltip content={ProfilerLineChartTooltip} />
      <Area type="stepBefore" dataKey="extractDuration" stroke="#63B3ED" fill="#63B3ED" animationDuration={500} />
      <Area type="stepBefore" dataKey="renderDuration" stroke="#2B6CB0" fill="#2B6CB0" animationDuration={500} />
    </AreaChart>
  );
};

export default ProfilerLineChart;
