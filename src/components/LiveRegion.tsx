/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";

/** A polite aria-live region for transient announcements */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
    >
      {message}
    </div>
  );
}
