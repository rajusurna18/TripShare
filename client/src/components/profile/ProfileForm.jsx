function ProfileForm({

  bio,

  setBio,

  interests,

  setInterests,

  travelStyle,

  setTravelStyle,

  personality,

  setPersonality,

  setImage,

  updateProfile,

  saving,

}) {

  return (

    <div className="glass-card p-5">

      {/* BIO */}

      <div className="mb-4">

        <label className="form-label fw-bold">

          Bio

        </label>

        <textarea

          className="form-control profile-input"

          rows="4"

          value={bio}

          onChange={(e) =>

            setBio(e.target.value)

          }

        />

      </div>

      {/* INTERESTS */}

      <div className="mb-4">

        <label className="form-label fw-bold">

          Interests

        </label>

        <input

          type="text"

          className="form-control profile-input"

          placeholder="trekking, beaches, food"

          value={interests}

          onChange={(e) =>

            setInterests(

              e.target.value

            )

          }

        />

      </div>

      {/* TRAVEL STYLE */}

      <div className="mb-4">

        <label className="form-label fw-bold">

          Travel Style

        </label>

        <select

          className="form-select profile-input"

          value={travelStyle}

          onChange={(e) =>

            setTravelStyle(

              e.target.value

            )

          }

        >

          <option value="">

            Select Travel Style

          </option>

          <option value="Budget">

            Budget

          </option>

          <option value="Luxury">

            Luxury

          </option>

          <option value="Adventure">

            Adventure

          </option>

          <option value="Backpacking">

            Backpacking

          </option>

        </select>

      </div>

      {/* PERSONALITY */}

      <div className="mb-4">

        <label className="form-label fw-bold">

          Personality

        </label>

        <select

          className="form-select profile-input"

          value={personality}

          onChange={(e) =>

            setPersonality(

              e.target.value

            )

          }

        >

          <option value="">

            Select Personality

          </option>

          <option value="Introvert">

            Introvert

          </option>

          <option value="Extrovert">

            Extrovert

          </option>

        </select>

      </div>

      {/* IMAGE */}

      <div className="mb-4">

        <label className="form-label fw-bold">

          Upload Profile Image

        </label>

        <input

          type="file"

          className="form-control profile-input"

          onChange={(e) =>

            setImage(

              e.target.files[0]

            )

          }

        />

      </div>

      {/* BUTTON */}

      <button

        onClick={updateProfile}

        className="btn btn-warning px-5 py-3"

        disabled={saving}

      >

        {

          saving

          ? "Saving..."

          : "Save Profile 🚀"

        }

      </button>

    </div>

  );

}

export default ProfileForm;

