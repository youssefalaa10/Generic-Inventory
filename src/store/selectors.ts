export const selectAll = <T = any>(state: any, entity: string): T[] => {
  const slice: any = state?.[entity];
  if (!slice) return [];
  const byId = (slice.byId || {}) as Record<string, T>;
  const allIds = (slice.allIds || []) as string[];
  return allIds.map((id) => byId[id]).filter(Boolean) as T[];
};
