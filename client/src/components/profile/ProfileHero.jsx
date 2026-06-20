import Avatar from "../shared/Avatar";

function ProfileHero({
  user,
  completion,
  missingFields = [],
}) {
  return (
    <div className="glass-card p-5 mb-5 text-center position-relative overflow-hidden">
      {/* COVER */}
      <div
        style={{
          height: "220px",
          borderRadius: "25px",
          background: "linear-gradient(135deg, #ffb703, #fb8500)",
          marginBottom: "-90px",
        }}
      />

      {/* PROFILE IMAGE */}
      <Avatar
        src={user?.profileImage}
        alt="profile"
        className="profile-page-image shadow-lg border border-5 border-dark"
        size={180}
      />

      {/* NAME */}
      <h1 className="fw-bold mt-3">{user?.name}</h1>

      {/* EMAIL */}
      <p className="text-secondary">{user?.email}</p>

      {/* BADGES */}
      <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
        <span className="badge bg-warning text-dark px-4 py-2">
          🌍 {user?.travelStyle || "Explorer"}
        </span>
        {user?.isVerified && (
          <span className="badge bg-success px-4 py-2">
            ⭐ Verified Member
          </span>
        )}
        {completion >= 80 && (
          <span className="badge bg-primary px-4 py-2">
            ✈ AI Match Ready
          </span>
        )}
      </div>

      {/* PROFILE COMPLETION */}
      <div className="mt-5">
        <div className="d-flex justify-content-between mb-2">
          <span>Profile Strength</span>
          <span className="text-warning fw-bold">{completion}%</span>
        </div>
        <div className="progress profile-progress-bar">
          <div
            className="progress-bar bg-warning"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>

        {missingFields && missingFields.length > 0 && (
          <div
            className="mt-3 text-start bg-black p-3 rounded"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.05)",
              background: "#080808",
            }}
          >
            <small className="text-secondary d-block mb-2">
              Missing fields to reach 100% completion:
            </small>
            <div className="d-flex flex-wrap gap-2">
              {missingFields.map((field, idx) => (
                <span
                  key={idx}
                  className="badge bg-secondary"
                  style={{ fontSize: "11px", fontWeight: "normal" }}
                >
                  + {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHero;
