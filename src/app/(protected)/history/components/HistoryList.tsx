import { FC, memo } from 'react';
import { HistoryItem } from '../types';
import { NUTRITION_DATA } from '../constants';
import { formatDate } from '@/lib/utils';

type HistoryListProps = {
  history: HistoryItem[];
  onDayClick: (day: HistoryItem) => void;
};

export const HistoryList: FC<HistoryListProps> = memo(({ history, onDayClick }) => {
  return (
    <div className="space-y-4">
      {history.map((day) => (
        <div key={day.date} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onDayClick(day)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{formatDate(day.date)}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {day.consumptionsCount} meal{day.consumptionsCount !== 1 ? 's' : ''}
                </p>
              </div>

              <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {NUTRITION_DATA.map((nutrition) => (
                  <li key={nutrition.key}>
                    <div className={`text-lg font-bold ${nutrition.textColor}`}>
                      {nutrition.formatter(day[nutrition.key])}
                    </div>
                    <div className="text-xs text-gray-500">{nutrition.name}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

HistoryList.displayName = 'HistoryList';
