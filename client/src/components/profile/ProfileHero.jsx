function ProfileHero({

  user,

  completion,

}) {

  return (

    <div
      className="glass-card p-5 mb-5 text-center position-relative overflow-hidden"
    >

      {/* COVER */}

      <div
        style={{

          height: "220px",

          borderRadius: "25px",

          background:
            "linear-gradient(135deg, #ffb703, #fb8500)",

          marginBottom: "-90px",

        }}
      />

      {/* PROFILE IMAGE */}

      <img

        src={

          user?.profileImage ||

          "https://i.pravatar.cc/300"

        }

        alt="profile"

        className="profile-page-image shadow-lg border border-5 border-dark"

        style={{

          width: "180px",

          height: "180px",

          objectFit: "cover",

          marginBottom: "20px",

        }}

      />

      {/* NAME */}

      <h1 className="fw-bold mt-3">

        {user?.name}

      </h1>

      {/* EMAIL */}

      <p className="text-secondary">

        {user?.email}

      </p>

      {/* BADGES */}

      <div
        className="d-flex justify-content-center gap-3 flex-wrap mt-4"
      >

        <span className="badge bg-warning text-dark px-4 py-2">

          🌍 Explorer

        </span>

        <span className="badge bg-success px-4 py-2">

          ⭐ Trusted Traveler

        </span>

        <span className="badge bg-primary px-4 py-2">

          ✈ AI Match Ready

        </span>

      </div>

      {/* PROFILE COMPLETION */}

      <div className="mt-5">

        <div className="d-flex justify-content-between mb-2">

          <span>

            Profile Strength

          </span>

          <span className="text-warning fw-bold">

            {completion}%

          </span>

        </div>

        <div className="progress profile-progress-bar">

          <div

            className="progress-bar bg-warning"

            style={{

              width:
                `${completion}%`

            }}

          />

        </div>

      </div>

    </div>

  );

}

export default ProfileHero;
