/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useRef, useCallback } from "react";

/**
 * Prevent spamming interactions while effects resolve.
 * Call `lock()` to block, `unlock()` when done, `isLocked()` to check.
 */
export function useInteractionGuard() {
  const lockedRef = useRef(false);
  const lock = useCallback(() => { lockedRef.current = true; }, []);
  const unlock = useCallback(() => { lockedRef.current = false; }, []);
  const isLocked = useCallback(() => lockedRef.current, []);
  return { lock, unlock, isLocked };
}
