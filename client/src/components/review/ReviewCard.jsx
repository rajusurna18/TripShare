function ReviewCard({

  review,

}) {

  return (

    <div className="glass-card p-4 mb-4">

      {/* TOP */}

      <div className="d-flex align-items-center gap-3 mb-3">

        <img

          src={

            review?.reviewer
              ?.profileImage ||

            "https://i.pravatar.cc/150"

          }

          alt="reviewer"

          className="rounded-circle"

          style={{

            width: "60px",

            height: "60px",

            objectFit: "cover",

          }}

        />

        <div>

          <h5 className="m-0">

            {

              review?.reviewer
                ?.name

            }

          </h5>

          <small className="text-secondary">

            {

              review?.trip
                ?.title ||

              "Trip Traveler"

            }

          </small>

        </div>

      </div>

      {/* RATING */}

      <div className="mb-3">

        {

          [...Array(
            review.rating
          )].map(
            (_, index) => (

              <span
                key={index}
                className="text-warning fs-5"
              >

                ⭐

              </span>

            )
          )

        }

      </div>

      {/* COMMENT */}

      <p className="text-secondary mb-0">

        {

          review.comment ||

          "Great traveler!"

        }

      </p>

    </div>

  );

}

export default ReviewCard;
