/**
 * Returns a throttled version of `fn` that fires at most once per `wait` ms,
 * always eventually firing with the most recent arguments (trailing edge).
 * Used to cap how often we emit cursor-move events over the socket.
 */
const throttle = (fn, wait) => {
  let lastCall = 0;
  let timeoutId = null;
  let lastArgs = null;

  const invoke = () => {
    lastCall = Date.now();
    timeoutId = null;
    fn(...lastArgs);
  };

  return (...args) => {
    lastArgs = args;
    const now = Date.now();
    const remaining = wait - (now - lastCall);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      invoke();
    } else if (!timeoutId) {
      timeoutId = setTimeout(invoke, remaining);
    }
  };
};

export default throttle;
