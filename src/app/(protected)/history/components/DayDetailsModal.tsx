import { FC, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HistoryItem } from '../types';
import { formatDate, formatTime, calculateNutrients } from '@/lib/utils';

type DayDetailsModalProps = {
  selectedDay: HistoryItem | null;
  onClose: () => void;
};

export const DayDetailsModal: FC<DayDetailsModalProps> = memo(({ selectedDay, onClose }) => {
  return (
    <Dialog open={!!selectedDay} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {selectedDay && (
              <>
                {formatDate(selectedDay.date)} - Meals
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedDay.consumptionsCount} meal
                  {selectedDay.consumptionsCount !== 1 ? 's' : ''})
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {selectedDay && (
            <div className="space-y-3">
              {selectedDay.consumptions.map((consumption) => {
                const nutrients = calculateNutrients(consumption);

                return (
                  <div
                    key={consumption.id}
                    className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">{consumption.product.name}</h5>
                      <div className="text-sm text-gray-600">
                        <div className="mb-1">Amount: {consumption.amount}g</div>
                        <div className="flex flex-wrap gap-3">
                          <span>{nutrients.calories} cal</span>
                          <span>P: {nutrients.protein}g</span>
                          <span>F: {nutrients.fat}g</span>
                          <span>C: {nutrients.carbs}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 ml-4 flex-shrink-0">
                      {formatTime(new Date(consumption.createdAt))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

DayDetailsModal.displayName = 'DayDetailsModal';
