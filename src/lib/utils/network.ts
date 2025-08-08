// Helper function to determine if error is network-related
export const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_NETWORK') ||
      error.name === 'NetworkError')
  );
};
