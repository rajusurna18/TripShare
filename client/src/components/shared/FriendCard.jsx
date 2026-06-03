function FriendCard({

  user,

  onAccept,

  onReject,

  showActions,

}) {

  return (

    <div
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "20px",
        marginBottom: "20px",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >

        <img

          src={

            user?.profileImage ||

            "https://i.pravatar.cc/150"

          }

          alt="profile"

          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            objectFit: "cover",
          }}

        />

        <div>

          <h4>

            {user?.name}

          </h4>

          <p
            style={{
              color: "#aaa",
            }}
          >

            {user?.email}

          </p>

        </div>

      </div>

      {

        showActions && (

          <div
            className="mt-4 d-flex gap-3"
          >

            <button

              className="btn btn-success"

              onClick={onAccept}

            >

              Accept

            </button>

            <button

              className="btn btn-danger"

              onClick={onReject}

            >

              Reject

            </button>

          </div>

        )

      }

    </div>

  );

}

export default FriendCard;