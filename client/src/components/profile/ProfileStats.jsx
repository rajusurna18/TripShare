function ProfileStats({ user }) {

  return (

    <div className="stats-grid-auto mb-5">

      <div>

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.friends?.length || 0}

          </h2>

          <p className="text-secondary m-0">

            Friends

          </p>

        </div>

      </div>

      <div>

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.followers?.length || 0}

          </h2>

          <p className="text-secondary m-0">

            Followers

          </p>

        </div>

      </div>

      <div>

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.following?.length || 0}

          </h2>

          <p className="text-secondary m-0">

            Following

          </p>

        </div>

      </div>

      <div>

        <div className="glass-card p-4 text-center h-100">

          <h2 className="text-warning fw-bold">

            {user?.totalTrips || 0}

          </h2>

          <p className="text-secondary m-0">

            Trips

          </p>

        </div>

      </div>

    </div>

  );

}

export default ProfileStats;

