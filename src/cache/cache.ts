type CacheEntry<T> = {
  data: T;
  expiry: number;
};

export class SimpleCache<T> {
  private cache: CacheEntry<T> | null = null;
  private ttl: number;

  constructor(ttlMinutes: number) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(): T | null {
    if (!this.cache) return null;
    if (Date.now() > this.cache.expiry) {
      this.cache = null;
      return null;
    }
    return this.cache.data;
  }

  set(data: T) {
    this.cache = {
      data,
      expiry: Date.now() + this.ttl,
    };
  }

  clear() {
    this.cache = null;
  }
}
