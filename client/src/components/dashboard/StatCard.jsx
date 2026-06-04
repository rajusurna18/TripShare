function StatCard({

  title,

  value,

  icon,

  color = "warning",

}) {

  return (

    <div className="col-lg-4 col-md-6">

      <div className="glass-card p-4 h-100 text-center">

        <div
          className={`text-${color} mb-3`}
          style={{
            fontSize: "40px",
          }}
        >

          {icon}

        </div>

        <h2
          className={`fw-bold text-${color}`}
        >

          {value}

        </h2>

        <p className="text-secondary mb-0">

          {title}

        </p>

      </div>

    </div>

  );

}

export default StatCard;