function TravelerBadges({

  travelStyle,

  personality,

}) {

  return (

    <div className="glass-card p-4 mb-5">

      <h3 className="mb-4">

        Traveler Identity ✨

      </h3>

      <div className="d-flex flex-wrap gap-3">

        {

          travelStyle && (

            <span className="badge bg-primary px-4 py-3">

              ✈ {travelStyle}

            </span>

          )

        }

        {

          personality && (

            <span className="badge bg-success px-4 py-3">

              🧠 {personality}

            </span>

          )

        }

        <span className="badge bg-warning text-dark px-4 py-3">

          🌍 Explorer

        </span>

      </div>

    </div>

  );

}

export default TravelerBadges;

