import { motion } from "framer-motion";

function StatCard({

  title,

  value,

  icon,

  color = "warning",

}) {

  return (

    <div className="col-lg-4 col-md-6 col-12">

      <motion.div
        className="glass-card p-4 h-100 position-relative overflow-hidden"
        whileHover={{
          scale: 1.025,
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.35)",
          borderColor: "rgba(255, 193, 7, 0.2)"
        }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        style={{

          borderRadius: "24px",

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

      </motion.div>

    </div>

  );

}

export default StatCard;