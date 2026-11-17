export function logError(context: string): (error: unknown) => void {
  return (error) => {
    console.error(`[${context}]`, error);
  };
}
