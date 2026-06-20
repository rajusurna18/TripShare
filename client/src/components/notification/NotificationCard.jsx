import Avatar from "../shared/Avatar";

function NotificationCard({

  notification,

  onRead,

}) {

  return (

    <div
      className={`glass-card p-4 ${
        !notification.read
          ? "border border-warning"
          : ""
      }`}
    >

      <div className="d-flex justify-content-between align-items-start gap-3">

        <div className="d-flex align-items-center gap-3">
          <Avatar src={notification.sender?.profileImage} size={50} />
          <div>
            <h5 className="mb-2">
              {notification.message}
            </h5>
            <small className="text-secondary">
              {
                new Date(
                  notification.createdAt
                ).toLocaleString()
              }
            </small>
          </div>
        </div>

        {

          !notification.read && (

            <button

              className="btn btn-warning btn-sm"

              onClick={() =>
                onRead(notification._id)
              }

            >

              Mark Read

            </button>

          )

        }

      </div>

    </div>

  );

}

export default NotificationCard;