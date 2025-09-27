/**
 * Redis Cache Manager with Fallback
 * Provides high-performance caching with in-memory fallback when Redis is unavailable
 */

class RedisCacheManager {
    constructor(options = {}) {
        this.config = {
            host: options.host || 'localhost',
            port: options.port || 6379,
            password: options.password || null,
            db: options.db || 0,
            keyPrefix: options.keyPrefix || 'persian-legal-ai:',
            defaultTTL: options.defaultTTL || 3600, // 1 hour
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 1000,
            enableFallback: options.enableFallback !== false,
            ...options
        };

        this.redis = null;
        this.fallbackCache = new Map();
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
            fallbackHits: 0,
            fallbackSets: 0
        };

        this.initialize();
    }

    async initialize() {
        try {
            await this.connectToRedis();
        } catch (error) {
            console.warn('⚠️ Redis connection failed, using fallback cache:', error.message);
            this.isConnected = false;
        }
    }

    async connectToRedis() {
        try {
            const redisModule = await import('redis');
            const { createClient } = redisModule;

            this.redis = createClient({
                socket: {
                    host: this.config.host,
                    port: this.config.port,
                    reconnectStrategy: (retries) => {
                        if (retries > this.config.maxRetries) {
                            console.warn('⚠️ Redis max retries reached');
                            return new Error('Max retries reached');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
                password: this.config.password ?? undefined,
                database: this.config.db,
            });

            this.redis.on('connect', () => {
                console.log('✅ Redis connected successfully');
                this.isConnected = true;
                this.connectionAttempts = 0;
            });

            this.redis.on('error', (error) => {
                console.error('❌ Redis error:', error);
                this.isConnected = false;
                this.stats.errors++;
            });

            this.redis.on('end', () => {
                console.log('🔌 Redis connection ended');
                this.isConnected = false;
            });

            await this.redis.connect();

        } catch (error) {
            console.warn('⚠️ Redis not available, using fallback cache:', error.message);
            this.isConnected = false;
        }
    }

    getKey(key) {
        return `${this.config.keyPrefix}${key}`;
    }

    async get(key) {
        try {
            if (this.isConnected && this.redis) {
                const value = await this.redis.get(this.getKey(key));
                if (value !== null) {
                    this.stats.hits++;
                    return JSON.parse(value);
                } else {
                    this.stats.misses++;
                    return null;
                }
            } else {
                // Use fallback cache
                const value = this.fallbackCache.get(key);
                if (value !== undefined) {
                    // Check TTL
                    if (value.expires && Date.now() > value.expires) {
                        this.fallbackCache.delete(key);
                        this.stats.misses++;
                        return null;
                    }
                    this.stats.fallbackHits++;
                    return value.data;
                } else {
                    this.stats.misses++;
                    return null;
                }
            }
        } catch (error) {
            console.error('❌ Cache get error:', error);
            this.stats.errors++;
            return null;
        }
    }

    async set(key, value, ttl = null) {
        try {
            const actualTTL = ttl || this.config.defaultTTL;
            
            if (this.isConnected && this.redis) {
                await this.redis.setex(this.getKey(key), actualTTL, JSON.stringify(value));
                this.stats.sets++;
            } else {
                // Use fallback cache
                this.fallbackCache.set(key, {
                    data: value,
                    expires: Date.now() + (actualTTL * 1000)
                });
                this.stats.fallbackSets++;
                
                // Cleanup expired entries periodically
                this.cleanupFallbackCache();
            }
        } catch (error) {
            console.error('❌ Cache set error:', error);
            this.stats.errors++;
        }
    }

    async del(key) {
        try {
            if (this.isConnected && this.redis) {
                await this.redis.del(this.getKey(key));
            } else {
                this.fallbackCache.delete(key);
            }
            this.stats.deletes++;
        } catch (error) {
            console.error('❌ Cache delete error:', error);
            this.stats.errors++;
        }
    }

    async exists(key) {
        try {
            if (this.isConnected && this.redis) {
                const result = await this.redis.exists(this.getKey(key));
                return result === 1;
            } else {
                const value = this.fallbackCache.get(key);
                if (value && value.expires && Date.now() > value.expires) {
                    this.fallbackCache.delete(key);
                    return false;
                }
                return value !== undefined;
            }
        } catch (error) {
            console.error('❌ Cache exists error:', error);
            this.stats.errors++;
            return false;
        }
    }

    async expire(key, ttl) {
        try {
            if (this.isConnected && this.redis) {
                await this.redis.expire(this.getKey(key), ttl);
            } else {
                const value = this.fallbackCache.get(key);
                if (value) {
                    value.expires = Date.now() + (ttl * 1000);
                }
            }
        } catch (error) {
            console.error('❌ Cache expire error:', error);
            this.stats.errors++;
        }
    }

    async flush() {
        try {
            if (this.isConnected && this.redis) {
                const keys = await this.redis.keys(`${this.config.keyPrefix}*`);
                if (keys.length > 0) {
                    await this.redis.del(keys);
                }
            } else {
                this.fallbackCache.clear();
            }
        } catch (error) {
            console.error('❌ Cache flush error:', error);
            this.stats.errors++;
        }
    }

    async getStats() {
        try {
            let redisInfo = null;
            if (this.isConnected && this.redis) {
                redisInfo = await this.redis.info('memory');
            }

            return {
                connected: this.isConnected,
                stats: this.stats,
                fallbackCacheSize: this.fallbackCache.size,
                redisInfo: redisInfo ? this.parseRedisInfo(redisInfo) : null,
                config: {
                    host: this.config.host,
                    port: this.config.port,
                    db: this.config.db,
                    keyPrefix: this.config.keyPrefix
                }
            };
        } catch (error) {
            console.error('❌ Cache stats error:', error);
            return {
                connected: false,
                stats: this.stats,
                fallbackCacheSize: this.fallbackCache.size,
                error: error.message
            };
        }
    }

    parseRedisInfo(info) {
        const lines = info.split('\r\n');
        const parsed = {};
        
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                parsed[key] = value;
            }
        });
        
        return parsed;
    }

    cleanupFallbackCache() {
        const now = Date.now();
        for (const [key, value] of this.fallbackCache.entries()) {
            if (value.expires && now > value.expires) {
                this.fallbackCache.delete(key);
            }
        }
    }

    // Cache middleware for Express
    middleware(options = {}) {
        const {
            ttl = this.config.defaultTTL,
            keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
            skipCache = (req, res) => false,
            onHit = (req, res, data) => {},
            onMiss = (req, res) => {}
        } = options;

        return async (req, res, next) => {
            try {
                // Skip cache if specified
                if (skipCache(req, res)) {
                    return next();
                }

                const cacheKey = keyGenerator(req);
                const cachedData = await this.get(cacheKey);

                if (cachedData !== null) {
                    // Cache hit
                    onHit(req, res, cachedData);
                    return res.json(cachedData);
                }

                // Cache miss - capture response
                onMiss(req, res);
                const originalJson = res.json;
                
                res.json = (data) => {
                    // Cache the response
                    this.set(cacheKey, data, ttl);
                    return originalJson.call(res, data);
                };

                next();
            } catch (error) {
                console.error('❌ Cache middleware error:', error);
                next();
            }
        };
    }

    // Cache decorator for functions
    cache(ttl = this.config.defaultTTL, keyGenerator = (...args) => args.join(':')) {
        return (target, propertyName, descriptor) => {
            const method = descriptor.value;
            
            descriptor.value = async function(...args) {
                const cacheKey = keyGenerator(...args);
                const cached = await this.get(cacheKey);
                
                if (cached !== null) {
                    return cached;
                }
                
                const result = await method.apply(this, args);
                await this.set(cacheKey, result, ttl);
                return result;
            };
            
            return descriptor;
        };
    }

    async close() {
        try {
            if (this.redis) {
                await this.redis.quit();
            }
            this.fallbackCache.clear();
            console.log('✅ Cache manager closed');
        } catch (error) {
            console.error('❌ Error closing cache manager:', error);
        }
    }
}

export default RedisCacheManager;
