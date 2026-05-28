
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

function AnalyticsChart({ history }) {

  const chartData = history.map((item) => ({

    name:
      item.filename.length > 10
        ? item.filename.substring(0, 10) + "..."
        : item.filename,

    score: item.ats_score
  }))

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg mt-10">

      <h2 className="text-2xl font-bold mb-6">
        ATS Score Analytics
      </h2>

      <div className="w-full h-96">

        <ResponsiveContainer>

          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="score"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  )
}

export default AnalyticsChart

