export function useNumbers() {
  /**
   * checks if a timestamp is in seconds or milliseconds. if it is in seconds, it multiplies it to 1000.
   * @note checks only by checking if the length of the timestamp in 10 numbers.
   * @param timestamp {number}
   * @returns timestamp - timestamp in milliseconds
   */
  function checkIfTimestampIsMilliseconds(timestamp: number): number {
    const length = String(timestamp).length;

    if (length === 10) return timestamp * 1000;
    return timestamp;
  }

  return {
    checkIfTimestampIsMilliseconds,
  };
}