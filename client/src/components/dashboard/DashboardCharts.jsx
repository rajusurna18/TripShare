import {

  ResponsiveContainer,

  PieChart,

  Pie,

  Cell,

  Tooltip,

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

} from "recharts";

function DashboardCharts({

  stats,

}) {

  const pieData = [

    {
      name: "Trips Created",
      value:
        stats?.tripsCreated || 0,
    },

    {
      name: "Trips Joined",
      value:
        stats?.tripsJoined || 0,
    },

    {
      name: "Friends",
      value:
        stats?.totalFriends || 0,
    },

  ];

  const barData = [

    {
      name: "Reviews",
      value:
        stats?.totalReviews || 0,
    },

    {
      name: "Trust",
      value:
        stats?.trustScore || 0,
    },

    {
      name: "Expenses",
      value:
        stats?.totalExpenses || 0,
    },

  ];

  const COLORS = [

    "#ffb703",

    "#fb8500",

    "#219ebc",

  ];

  return (

    <div className="row g-4 mt-3">

      {/* PIE CHART */}

      <div className="col-lg-6">

        <div className="glass-card p-4">

          <h4 className="mb-4">

            Travel Activity

          </h4>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie

                data={pieData}

                cx="50%"

                cy="50%"

                outerRadius={100}

                dataKey="value"

                label

              >

                {

                  pieData.map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell

                        key={index}

                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }

                      />

                    )
                  )

                }

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* BAR CHART */}

      <div className="col-lg-6">

        <div className="glass-card p-4">

          <h4 className="mb-4">

            Performance Metrics

          </h4>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={barData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#ffb703"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );

}

export default DashboardCharts;