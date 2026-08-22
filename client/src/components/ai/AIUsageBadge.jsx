import React from "react";

/**
 * Compact AI Usage Badge component.
 * Displays current tool usage in a luxury dark pill format with gold accents.
 */
export default function AIUsageBadge({ toolSummary, onUpgrade, compact = false }) {
  if (!toolSummary) return null;

  const { limit, consumed, remaining, isFreeLimit, plan } = toolSummary;

  const isExhausted = remaining <= 0;

  // Format label: e.g. "⚡ 15/15 free" or "⚡ 12 left" or "⚡ 180/200"
  let badgeLabel = "";
  if (isFreeLimit) {
    if (isExhausted) {
      badgeLabel = `⚡ 0/${limit} free`;
    } else {
      badgeLabel = `⚡ ${remaining}/${limit} free`;
    }
  } else {
    badgeLabel = `⚡ ${consumed}/${limit} (${plan})`;
  }

  return (
    <div
      onClick={onUpgrade}
      className={`d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill ${onUpgrade ? "cursor-pointer" : ""}`}
      style={{
        background: isExhausted
          ? "rgba(220, 53, 69, 0.15)"
          : "rgba(255, 215, 0, 0.08)",
        border: `1px solid ${isExhausted ? "rgba(220, 53, 69, 0.4)" : "rgba(255, 215, 0, 0.3)"}`,
        color: isExhausted ? "#ff6b6b" : "#ffd700",
        fontSize: compact ? "0.75rem" : "0.82rem",
        fontWeight: "600",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s ease-in-out",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
      title={isExhausted ? "Limit reached. Click to upgrade!" : "Click to view AI subscription plan"}
    >
      <span>{badgeLabel}</span>
      {onUpgrade && (
        <span
          className="badge rounded-pill bg-warning text-dark px-2 py-0"
          style={{ fontSize: "0.68rem", fontWeight: "700" }}
        >
          {isExhausted ? "Upgrade" : "Plan"}
        </span>
      )}
    </div>
  );
}
