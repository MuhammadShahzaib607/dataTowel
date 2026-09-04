// Simple event bus for notification unread count changes
// Used to keep sidebar badge in sync with notification page actions

const EVENT_NAME = "unread-count-change";

export function dispatchUnreadCountChange(count: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count } }));
  }
}

export function onUnreadCountChange(callback: (count: number) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    callback(detail.count);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
