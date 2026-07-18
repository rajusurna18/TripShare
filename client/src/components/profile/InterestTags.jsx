function InterestTags({ interests }) {

  return (

    <div className="glass-card p-4 mb-5">

      <h3 className="mb-4">

        Interests 🌍

      </h3>

      <div className="d-flex flex-wrap gap-3">

        {

          interests?.length > 0

          ? (

            interests.map(

              (interest, index) => (

                <span

                  key={index}

                  className="badge bg-warning text-dark px-4 py-3"

                  style={{

                    fontSize: "14px",

                    borderRadius: "50px",

                  }}

                >

                  #{interest}

                </span>

              )

            )

          )

          : (

            <p className="text-secondary">

              No interests added yet

            </p>

          )

        }

      </div>

    </div>

  );

}

export default InterestTags;
