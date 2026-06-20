import Avatar from "./Avatar";

function FriendCard({

  user,

  onAccept,

  onReject,

  showActions,

}) {

  return (

    <div
      className="glass-card friend-card"
      style={{
        marginBottom: "20px",
      }}
    >

      <div
        className="friend-card-content"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >

        <Avatar
          src={user?.profileImage}
          alt="profile"
          className="friend-avatar"
          size={70}
        />

        <div
          style={{
            flex: 1,
            minWidth: "200px",
          }}
        >

          <h4 className="mb-1">

            {user?.name}

          </h4>

          <p
            className="text-secondary mb-0"
            style={{
              wordBreak: "break-word",
            }}
          >

            {user?.email}

          </p>

        </div>

      </div>

      {

        showActions && (

          <div
            className="friend-actions mt-4"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <button

              className="btn btn-success"

              onClick={onAccept}

            >

              ✅ Accept

            </button>

            <button

              className="btn btn-danger"

              onClick={onReject}

            >

              ❌ Reject

            </button>

          </div>

        )

      }

    </div>

  );

}

export default FriendCard;