import { useState } from "react";
import API from "../../services/api";

function AddMemoryModal({
  tripId,
  fetchMemories,
}) {

  const [caption, setCaption] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submitMemory =
    async () => {

      if (!image) {
        alert("Please select image");
        return;
      }

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "caption",
          caption
        );

        formData.append(
          "image",
          image
        );

        await API.post(
          `/memories/${tripId}`,
          formData
        );

        setCaption("");
        setImage(null);
        setPreview("");

        fetchMemories();

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }
  };

  return (
    <div className="glass-card p-4 mb-5">

      <h3 className="mb-4">
        Add New Memory ✨
      </h3>

      <input
        type="file"
        className="form-control mb-3"
        accept="image/*"
        onChange={(e) => {

          const file =
            e.target.files[0];

          setImage(file);

          if (file) {

            setPreview(
              URL.createObjectURL(file)
            );

          }
        }}
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="img-fluid rounded mb-3"
          style={{
            maxHeight: "300px",
            width: "100%",
            objectFit: "cover",
          }}
        />
      )}

      <textarea
        rows="3"
        className="form-control mb-3"
        placeholder="Write a travel memory..."
        value={caption}
        onChange={(e) =>
          setCaption(e.target.value)
        }
      />

      <button
        className="btn btn-warning"
        disabled={loading}
        onClick={submitMemory}
      >
        {loading
          ? "Uploading..."
          : "Upload Memory 📸"}
      </button>

    </div>
  );
}

export default AddMemoryModal;