function StatCard({

  title,

  value,

  icon,

  color = "warning",

}) {

  return (

    <div className="col-xl-4 col-lg-6 col-md-6">

      <div
        className="glass-card p-4 h-100 position-relative overflow-hidden"
        style={{

          borderRadius: "24px",

          transition:
            "all 0.3s ease",

          minHeight: "180px",

        }}
      >

        {/* ICON */}

        <div
          className={`text-${color}`}
          style={{

            fontSize: "48px",

            position: "absolute",

            right: "20px",

            top: "15px",

            opacity: 0.2,

          }}
        >

          {icon}

        </div>

        {/* TITLE */}

        <p
          className="text-secondary mb-2"
          style={{

            fontSize: "14px",

            textTransform:
              "uppercase",

            letterSpacing: "1px",

          }}
        >

          {title}

        </p>

        {/* VALUE */}

        <h1
          className={`fw-bold text-${color} mb-3`}
          style={{

            fontSize: "42px",

          }}
        >

          {value}

        </h1>

        {/* FOOTER */}

        <div
          className="d-flex align-items-center gap-2"
        >

          <span
            className={`badge bg-${color}`}
          >

            Live

          </span>

          <small className="text-secondary">

            Updated from database

          </small>

        </div>

      </div>

    </div>

  );

}

export default StatCard;