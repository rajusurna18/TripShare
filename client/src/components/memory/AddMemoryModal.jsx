import {
  useState,
} from "react";

import API
from "../../services/api";

function AddMemoryModal({

  tripId,

  fetchMemories,

}) {

  const [caption, setCaption] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const submitMemory =
    async () => {

      if (!image) {

        alert(
          "Please select image"
        );

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

        Add Memory 📸

      </h3>

      <input

        type="file"

        className="form-control mb-3"

        onChange={(e) =>

          setImage(
            e.target.files[0]
          )

        }

      />

      <textarea

        className="form-control mb-3"

        rows="3"

        placeholder="Write a caption..."

        value={caption}

        onChange={(e) =>

          setCaption(
            e.target.value
          )

        }

      />

      <button

        className="btn btn-warning"

        onClick={
          submitMemory
        }

        disabled={loading}

      >

        {

          loading

            ? "Uploading..."

            : "Upload Memory"

        }

      </button>

    </div>

  );

}

export default AddMemoryModal;