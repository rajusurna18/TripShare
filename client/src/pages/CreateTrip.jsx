import { useState } from "react";

import API from "../services/api";

import toast from "react-hot-toast";

function CreateTrip() {

  const [loading, setLoading] =
    useState(false);

  const [tripData, setTripData] =
    useState({

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

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

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

              Authorization:
                token,

              "Content-Type":
                "multipart/form-data",

            },
          }

        );

        toast.success(
          "Trip Created Successfully ✈️"
        );

        setTripData({

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

        setImage(null);

      } catch (err) {

        toast.error(
          err.response?.data?.message ||
          "Trip Creation Failed"
        );

      } finally {

        setLoading(false);

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

              {/* TITLE */}

              <div className="col-md-6">

                <label className="form-label">

                  Trip Title

                </label>

                <input
                  type="text"
                  name="title"
                  value={tripData.title}
                  className="form-control trip-input"
                  placeholder="please enter trip title"
                  onChange={handleChange}
                  minLength="3"
                  required
                />

              </div>

              {/* DESTINATION */}

              <div className="col-md-6">

                <label className="form-label">

                  Destination

                </label>

                <input
                  type="text"
                  name="destination"
                  value={tripData.destination}
                  className="form-control trip-input"
                  placeholder="please enter destination"
                  onChange={handleChange}
                  required
                />

              </div>

              {/* BUDGET */}

              <div className="col-md-6">

                <label className="form-label">

                  Budget

                </label>

                <input
                  type="number"
                  name="budget"
                  value={tripData.budget}
                  className="form-control trip-input"
                  placeholder="please enter budget"
                  onChange={handleChange}
                  min="100"
                  required
                />

              </div>

              {/* DATE */}

              <div className="col-md-6">

                <label className="form-label">

                  Travel Date

                </label>

                <input
                  type="date"
                  name="date"
                  value={tripData.date}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
                />

              </div>

              {/* TRAVELERS */}

              <div className="col-md-6">

                <label className="form-label">

                  Travelers

                </label>

                <input
                  type="number"
                  name="travelers"
                  value={tripData.travelers}
                  className="form-control trip-input"
                  placeholder="number of travelers"
                  onChange={handleChange}
                  min="1"
                  max="50"
                />

              </div>

              {/* CATEGORY */}

              <div className="col-md-6">

                <label className="form-label">

                  Trip Category

                </label>

                <select
                  name="category"
                  value={tripData.category}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
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

              {/* TRANSPORT */}

              <div className="col-md-6">

                <label className="form-label">

                  Transport Mode

                </label>

                <select
                  name="transport"
                  value={tripData.transport}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
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

              {/* VISIBILITY */}

              <div className="col-md-6">

                <label className="form-label">

                  Visibility

                </label>

                <select
                  name="visibility"
                  value={tripData.visibility}
                  className="form-control trip-input"
                  onChange={handleChange}
                  required
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

              {/* IMAGE */}

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

                <small className="text-secondary">

                  Upload travel destination image

                </small>

              </div>

              {/* DESCRIPTION */}

              <div className="col-md-12">

                <label className="form-label">

                  Trip Description

                </label>

                <textarea
                  rows="5"
                  name="description"
                  value={tripData.description}
                  className="form-control trip-input"
                  placeholder="Describe your dream trip..."
                  onChange={handleChange}
                  minLength="20"
                  required
                />

              </div>

              {/* BUTTON */}

              <div className="col-md-12">

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-custom w-100"
                >

                  {
                    loading
                    ? "Creating Trip..."
                    : "Create Trip 🚀"
                  }

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