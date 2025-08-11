'use client';
import { useCallback, useMemo, useState } from 'react';
import { trpc } from '../../../lib/trpc-client';
import { HistoryItem } from './types';
import { HistoryFilters } from './components/HistoryFilters';
import { HistoryList } from './components/HistoryList';
import { DayDetailsModal } from './components/DayDetailsModal';
import SidePanel from '@/components/SidePanel';
import { Button } from '@/components/ui/button';
import ProductList from './components/ProductList';

type HistoryClientProps = {
  initialHistory: HistoryItem[] | null;
  initialError: string | null;
  userId: number | null;
};

export default function HistoryClient({
  initialHistory,
  initialError,
  userId,
}: HistoryClientProps) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);
  const [selectedDay, setSelectedDay] = useState<HistoryItem | null>(null);

  const {
    data: history,
    isLoading,
    error,
  } = trpc.consumption.getHistory.useQuery({ days: daysFilter }, { refetchOnWindowFocus: false });

  const handleCloseModal = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const displayHistory = useMemo(
    () => history || (daysFilter === 30 ? initialHistory : null),
    [history, daysFilter, initialHistory],
  );

  const displayError = error?.message || initialError;

  const sidePanelComponent = useMemo(
    () => (
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onOpen={() => setIsSidePanelOpen(true)}
        title="Products List"
        trigger={
          <Button variant="ghost" size="sm">
            Products List
          </Button>
        }
      >
        <ProductList userId={userId} />
      </SidePanel>
    ),
    [isSidePanelOpen, userId],
  );

  if (displayError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <div className="text-red-500">Error: {displayError}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HistoryFilters
        daysFilter={daysFilter}
        onDaysFilterChange={setDaysFilter}
        sidePanelComponent={sidePanelComponent}
      />

      {isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border">
          <div className="text-gray-500">Loading history...</div>
        </div>
      )}

      {displayHistory && displayHistory.length > 0 ? (
        <HistoryList history={displayHistory} onDayClick={setSelectedDay} />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 border text-center">
          <div className="text-gray-500">No nutrition data found for the selected period.</div>
          <p className="text-sm text-gray-400 mt-2">
            Start tracking your meals to see your history here!
          </p>
        </div>
      )}

      <DayDetailsModal selectedDay={selectedDay} onClose={handleCloseModal} />
    </div>
  );
}
