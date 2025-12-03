// utils/deviceId.ts

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    // Server-side, return a placeholder
    return 'server-side';
  }

  let id = localStorage.getItem("app_device_id");

  if (!id) {
    // Generate a simple UUID-like string (not cryptographically secure but good enough for tracking)
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem("app_device_id", id);
  }

  return id;
}