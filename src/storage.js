// Local storage shim matching the async window.storage API the app expects.
// In the Claude artifact environment window.storage is provided by the host;
// here we back it with localStorage so your configs persist in the browser.
const PREFIX = "ffwr:";

export const storage = {
  async get(key) {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? null : { key, value: raw };
  },
  async set(key, value) {
    localStorage.setItem(PREFIX + key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true };
  },
  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
    }
    return { keys, prefix };
  },
};
