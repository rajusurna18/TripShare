function JoinRequestCard({

  request,

  onAccept,

  onReject,

}) {

  return (

    <div className="glass-card p-4 mb-4">

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

        {/* USER */}

        <div className="d-flex align-items-center gap-3">

          <img

            src={

              request?.user
                ?.profileImage ||

              "https://i.pravatar.cc/150"

            }

            alt="profile"

            className="rounded-circle"

            style={{

              width: "70px",

              height: "70px",

              objectFit: "cover",

            }}

          />

          <div>

            <h4 className="m-0">

              {

                request?.user?.name

              }

            </h4>

            <small className="text-secondary">

              {

                request?.user?.email

              }

            </small>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="d-flex gap-2">

          <button

            className="btn btn-success"

            onClick={() =>

              onAccept(
                request._id
              )

            }

          >

            Accept ✅

          </button>

          <button

            className="btn btn-danger"

            onClick={() =>

              onReject(
                request._id
              )

            }

          >

            Reject ❌

          </button>

        </div>

      </div>

    </div>

  );

}

export default JoinRequestCard;