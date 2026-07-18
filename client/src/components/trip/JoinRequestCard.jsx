import Avatar from "../shared/Avatar";

function JoinRequestCard({

  request,

  onAccept,

  onReject,

}) {

  return (

    <div className="glass-card p-4 mb-4">

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">

        {/* USER INFO */}

        <div className="d-flex flex-column flex-sm-row align-items-center text-center text-sm-start gap-3">

          <Avatar
            src={request?.user?.profileImage}
            alt="profile"
            className="rounded-circle"
            style={{
              border: "3px solid #ffc107",
            }}
            size={80}
          />

          <div>

            <h4 className="m-0 fw-bold">

              {request?.user?.name}

            </h4>

            <small className="text-secondary">

              {request?.user?.email}

            </small>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">

          <button

            className="btn btn-success"

            onClick={() =>

              onAccept(request._id)

            }

          >

            Accept ✅

          </button>

          <button

            className="btn btn-danger"

            onClick={() =>

              onReject(request._id)

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