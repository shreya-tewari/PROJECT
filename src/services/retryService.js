/**
 * Retry Policy Service
 * Executes async tasks with exponential backoff retry policies.
 */

export async function executeWithRetry(fn, { maxRetries = 2, delayMs = 500, backoffFactor = 2 } = {}) {
  let attempt = 0;
  let currentDelay = delayMs;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        throw err;
      }
      console.warn(`[RetryPolicy] Attempt ${attempt} failed: ${err.message}. Retrying in ${currentDelay}ms...`);
      await new Promise(res => setTimeout(res, currentDelay));
      currentDelay *= backoffFactor;
    }
  }
}
