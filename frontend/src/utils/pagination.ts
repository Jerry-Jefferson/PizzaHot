export type PageItem = number | "start-ellipsis" | "end-ellipsis";

const MAX_ITEMS_WITHOUT_ELLIPSIS = 7;

export function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= MAX_ITEMS_WITHOUT_ELLIPSIS) {
    return Array.from({ length: Math.max(totalPages, 0) }, (_, index) => index + 1);
  }

  const page = Math.min(Math.max(currentPage, 1), totalPages);
  let windowStart = page - 1;
  let windowEnd = page + 1;
  if (page <= 3) {
    windowStart = 2;
    windowEnd = 4;
  } else if (page >= totalPages - 2) {
    windowStart = totalPages - 3;
    windowEnd = totalPages - 1;
  }

  const items: PageItem[] = [1];
  if (windowStart > 2) {
    items.push("start-ellipsis");
  }
  for (let item = windowStart; item <= windowEnd; item += 1) {
    items.push(item);
  }
  if (windowEnd < totalPages - 1) {
    items.push("end-ellipsis");
  }
  items.push(totalPages);
  return items;
}
