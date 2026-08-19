function TravelerBadges({ travelStyle, personality }) {
  return (
    <div className="glass-card p-4 mb-4">
      <h3 className="mb-4">Traveler Identity ✨</h3>
      <div className="d-flex flex-wrap gap-2">
        {travelStyle && (
          <span className="badge bg-primary px-3 py-2 text-nowrap flex-shrink-0" style={{ fontSize: "14px" }}>
            ✈ {travelStyle}
          </span>
        )}
        {personality && (
          <span className="badge bg-success px-3 py-2 text-nowrap flex-shrink-0" style={{ fontSize: "14px" }}>
            🧠 {personality}
          </span>
        )}
        <span className="badge bg-warning text-dark px-3 py-2 text-nowrap flex-shrink-0" style={{ fontSize: "14px" }}>
          🌍 Explorer
        </span>
      </div>
    </div>
  );
}

export default TravelerBadges;

