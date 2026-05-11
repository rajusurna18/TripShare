import { useState } from "react";

import API from "../services/api";

function CreateTrip() {

  const [tripData, setTripData] = useState({

    title: "",
    destination: "",
    budget: "",
    date: "",
    travelers: "",
    category: "",
    transport: "",
    visibility: "",
    description: "",

  });

  const [image, setImage] =
    useState(null);

  const handleChange = (e) => {

    setTripData({

      ...tripData,

      [e.target.name]:
        e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const formData =
        new FormData();

      Object.keys(tripData)
        .forEach((key) => {

          formData.append(
            key,
            tripData[key]
          );

        });

      if (image) {

        formData.append(
          "image",
          image
        );

      }

      const token =
        localStorage.getItem(
          "token"
        );

      await API.post(

        "/api/trips",

        formData,

        {
          headers: {

            Authorization: token,

            "Content-Type":
              "multipart/form-data",

          },
        }

      );

      alert(
        "Trip Created Successfully ✈️"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Trip Creation Failed"
      );

    }

  };

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <div className="create-trip-box">

          <div className="text-center mb-5">

            <h1 className="section-title">
              Create Your Dream Trip ✈️
            </h1>

            <p>
              Plan adventures,
              invite travelers,
              and explore the
              world smarter.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="row g-4">

              <div className="col-md-6">

                <label className="form-label">
                  Trip Title
                </label>

                <input
                  type="text"
                  name="title"
                  className="form-control trip-input"
                  placeholder="Goa Beach Adventure"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Destination
                </label>

                <input
                  type="text"
                  name="destination"
                  className="form-control trip-input"
                  placeholder="Goa"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Budget
                </label>

                <input
                  type="number"
                  name="budget"
                  className="form-control trip-input"
                  placeholder="5000"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Travel Date
                </label>

                <input
                  type="date"
                  name="date"
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Travelers
                </label>

                <input
                  type="number"
                  name="travelers"
                  className="form-control trip-input"
                  placeholder="4"
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Trip Category
                </label>

                <select
                  name="category"
                  className="form-control trip-input"
                  onChange={handleChange}
                >

                  <option value="">
                    Select Category
                  </option>

                  <option>
                    Adventure
                  </option>

                  <option>
                    Family
                  </option>

                  <option>
                    Solo
                  </option>

                  <option>
                    Friends
                  </option>

                  <option>
                    Nature
                  </option>

                </select>

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Transport Mode
                </label>

                <select
                  name="transport"
                  className="form-control trip-input"
                  onChange={handleChange}
                >

                  <option value="">
                    Select Transport
                  </option>

                  <option>
                    Flight
                  </option>

                  <option>
                    Train
                  </option>

                  <option>
                    Bus
                  </option>

                  <option>
                    Bike
                  </option>

                  <option>
                    Car
                  </option>

                </select>

              </div>

              <div className="col-md-6">

                <label className="form-label">
                  Visibility
                </label>

                <select
                  name="visibility"
                  className="form-control trip-input"
                  onChange={handleChange}
                >

                  <option value="">
                    Select Visibility
                  </option>

                  <option>
                    Public
                  </option>

                  <option>
                    Private
                  </option>

                </select>

              </div>

              <div className="col-md-12">

                <label className="form-label">
                  Upload Trip Image
                </label>

                <input
                  type="file"
                  className="form-control trip-input"
                  accept="image/*"
                  onChange={(e) =>
                    setImage(
                      e.target.files[0]
                    )
                  }
                />

              </div>

              <div className="col-md-12">

                <label className="form-label">
                  Trip Description
                </label>

                <textarea
                  rows="5"
                  name="description"
                  className="form-control trip-input"
                  placeholder="Describe your dream trip..."
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-12">

                <button
                  type="submit"
                  className="btn btn-custom w-100"
                >
                  Create Trip 🚀
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}

export default CreateTrip;