const buckets = new Map();

const rateLimiter = ({ windowMs = 60 * 1000, max = 60, keyGenerator } = {}) => {
  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > current.resetAt) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }
    current.count += 1;
    buckets.set(key, current);
    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    return next();
  };
};

module.exports = rateLimiter;
