import Avatar from "../shared/Avatar";
import API from "../../services/api";

function MemoryCard({
  memory,
  fetchMemories,
}) {

  const likeMemory =
    async () => {

      try {

        await API.put(
          `/memories/like/${memory._id}`
        );

        fetchMemories();

      } catch (err) {

        console.log(err);

      }
  };

  return (

    <div className="glass-card p-4 h-100">

      <div className="d-flex align-items-center gap-3 mb-3">

        <Avatar
          src={memory?.user?.profileImage}
          alt="user"
          className="rounded-circle"
          size={60}
        />

        <div>

          <h5 className="m-0">
            {memory?.user?.name}
          </h5>

          <small className="text-secondary">
            {new Date(
              memory.createdAt
            ).toLocaleString()}
          </small>

        </div>

      </div>

      <img
        src={memory.image}
        alt="memory"
        className="img-fluid rounded mb-3"
        style={{
          width: "100%",
          maxHeight: "450px",
          objectFit: "cover",
        }}
      />

      <p className="mb-3">
        {memory.caption}
      </p>

      <button
        className="btn btn-outline-warning"
        onClick={likeMemory}
      >
        ❤️ {memory.likes?.length || 0}
      </button>

    </div>
  );
}

export default MemoryCard;