import { FC, memo } from 'react';

type HistoryFiltersProps = {
  daysFilter: number;
  onDaysFilterChange: (days: number) => void;
};

export const HistoryFilters: FC<HistoryFiltersProps> = memo(
  ({ daysFilter, onDaysFilterChange }) => {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={daysFilter}
              onChange={(e) => onDaysFilterChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 2 weeks</option>
              <option value={30}>Last month</option>
              <option value={60}>Last 2 months</option>
              <option value={90}>Last 3 months</option>
            </select>
          </div>
        </div>
      </div>
    );
  },
);

HistoryFilters.displayName = 'HistoryFilters';
