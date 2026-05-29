
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import AnalyticsChart from "../components/AnalyticsChart"


function Dashboard() {

  const [file, setFile] = useState(null)

  const [jobDescription, setJobDescription] = useState("")

  const [loading, setLoading] = useState(false)

  const [result, setResult] = useState(null)

  const [history, setHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all")

  const reportRef = useRef()

  const username = localStorage.getItem("username")


  // Fetch Analysis History
  useEffect(() => {

    fetchHistory()

  }, [])


  const fetchHistory = async () => {

    try {

      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/analysis/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setHistory(response.data.history)

    } catch (error) {

      console.log(error)

      if (error.response?.status === 401) {

        handleLogout()
      }
    }
  }

  const filteredHistory = history.filter((item) => {

  const matchesSearch =
    item.filename
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )

  const matchesScore =

    scoreFilter === "all" ||

    (
      scoreFilter === "high" &&
      item.ats_score >= 70
    ) ||

    (
      scoreFilter === "medium" &&
      item.ats_score >= 50 &&
      item.ats_score < 70
    ) ||

    (
      scoreFilter === "low" &&
      item.ats_score < 50
    )

  return (
    matchesSearch &&
    matchesScore
  )
})

  // Analyze Resume
  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!file || !jobDescription) {

      alert("Please upload resume and enter job description")

      return
    }


    // File Validation
    if (
      !file.name.endsWith(".pdf") &&
      !file.name.endsWith(".docx")
    ) {

      alert("Only PDF and DOCX files allowed")

      return
    }


    // File Size Validation
    if (file.size > 5 * 1024 * 1024) {

      alert("File size must be less than 5MB")

      return
    }

    const formData = new FormData()

    formData.append("file", file)

    formData.append(
      "job_description",
      jobDescription
    )

    try {

      setLoading(true)

      const token = localStorage.getItem("token")

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/analysis/ai-suggestions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setResult(response.data)

      fetchHistory()

    } catch (error) {

      console.log(error)

      if (error.response?.status === 401) {

        alert("Session expired")

        handleLogout()

      } else {

        alert(
          error.response?.data?.detail ||
          "Error analyzing resume"
        )
      }

    } finally {

      setLoading(false)
    }
  }


  // Download PDF
  const downloadPDF = async () => {

    const input = reportRef.current

    const canvas = await html2canvas(input)

    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    )

    const pdfWidth =
      pdf.internal.pageSize.getWidth()

    const pdfHeight =
      (canvas.height * pdfWidth) /
      canvas.width

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    )

    pdf.save("ATS_Report.pdf")
  }

  const deleteAnalysis = async (id) => {

  try {

    const token = localStorage.getItem("token")

    await axios.delete(
      `${import.meta.env.VITE_API_URL}/analysis/history/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    fetchHistory()

  } catch (error) {

    console.log(error)

    alert("Failed to delete analysis")
  }
}
  // Logout
  const handleLogout = () => {

    localStorage.removeItem("token")

    localStorage.removeItem("username")

    window.location.href = "/"
  }


  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-5xl mx-auto">

        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-4xl font-bold text-blue-600">
              ATS Resume Analyzer
            </h1>

            <p className="text-gray-500 mt-1">

              Welcome,

              <span className="font-semibold ml-1">
                {username}
              </span>

            </p>

          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>


        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Upload Resume */}
            <div>

              <label className="block text-lg font-semibold mb-2">
                Upload Resume
              </label>

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
                className="w-full border border-gray-300 p-3 rounded-lg"
              />

            </div>


            {/* Job Description */}
            <div>

              <label className="block text-lg font-semibold mb-2">
                Job Description
              </label>

              <textarea
                rows="8"
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 p-4 rounded-lg"
                placeholder="Paste job description here..."
              />

            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >

              {
                loading ? (

                  <div className="flex justify-center items-center gap-3">

                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

                    <span>
                      AI Analyzing Resume...
                    </span>

                  </div>

                ) : (

                  "Analyze Resume"

                )
              }

            </button>

          </form>


          {/* Results */}
          {
            result && (

              <div
                ref={reportRef}
                className="mt-10 space-y-6"
              >

                {/* ATS Score */}
                <div className="bg-gray-50 p-6 rounded-lg">

                  <h2 className="text-2xl font-bold mb-6">
                    ATS Analysis
                  </h2>

                  <div className="mb-6">

                    <div className="flex justify-between mb-2">

                      <span className="font-semibold">
                        ATS Score
                      </span>

                      <span className="font-bold text-blue-600">
                        {
                          result.ats_analysis.ats_score
                        }%
                      </span>

                    </div>

                    <div className="w-full bg-gray-300 rounded-full h-5">

                      <div
                        className="bg-blue-600 h-5 rounded-full"
                        style={{
                          width:
                            `${result.ats_analysis.ats_score}%`
                        }}
                      />

                    </div>

                  </div>


                  {/* Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-white p-4 rounded-lg shadow">

                      <p className="text-gray-500">
                        Similarity Score
                      </p>

                      <p className="text-2xl font-bold">
                        {
                          result.ats_analysis.similarity_score
                        }
                      </p>

                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">

                      <p className="text-gray-500">
                        Skill Match Ratio
                      </p>

                      <p className="text-2xl font-bold">
                        {
                          result.ats_analysis.skill_match_ratio
                        }%
                      </p>

                    </div>

                  </div>

                </div>


                {/* Matched Skills */}
                <div className="bg-green-50 p-6 rounded-lg">

                  <h2 className="text-2xl font-bold mb-4 text-green-700">
                    Matched Skills
                  </h2>

                  <div className="flex flex-wrap gap-2">

                    {
                      result.ats_analysis.matched_keywords.map(
                        (skill, index) => (

                          <span
                            key={index}
                            className="bg-green-200 text-green-800 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>

                        )
                      )
                    }

                  </div>

                </div>


                {/* Missing Skills */}
                <div className="bg-red-50 p-6 rounded-lg">

                  <h2 className="text-2xl font-bold mb-4 text-red-700">
                    Missing Skills
                  </h2>

                  <div className="flex flex-wrap gap-2">

                    {
                      result.ats_analysis.missing_keywords.map(
                        (skill, index) => (

                          <span
                            key={index}
                            className="bg-red-200 text-red-800 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>

                        )
                      )
                    }

                  </div>

                </div>


                {/* AI Suggestions */}
                <div className="bg-blue-50 p-6 rounded-lg">

                  <h2 className="text-2xl font-bold mb-4 text-blue-700">
                    AI Suggestions
                  </h2>

                  <pre className="whitespace-pre-wrap text-gray-800">
                    {result.ai_suggestions}
                  </pre>

                </div>


                {/* Download PDF */}
                <div className="flex justify-end">

                  <button
                    onClick={downloadPDF}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Download PDF Report
                  </button>

                </div>

              </div>

            )
          }
          {/* Search and Filter */}
<div className="mt-10 bg-white p-6 rounded-lg shadow">

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Search */}
    <input
      type="text"
      placeholder="Search by filename..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(e.target.value)
      }
      className="border p-3 rounded-lg"
    />

    {/* Filter */}
    <select
      value={scoreFilter}
      onChange={(e) =>
        setScoreFilter(e.target.value)
      }
      className="border p-3 rounded-lg"
    >

      <option value="all">
        All Scores
      </option>

      <option value="high">
        High Score (70+)
      </option>

      <option value="medium">
        Medium Score (50-69)
      </option>

      <option value="low">
        Low Score (Below 50)
      </option>

    </select>

  </div>

</div>
          {/* Analytics Chart */}
{
  history.length > 0 && (
    <AnalyticsChart history={history} />
  )
}

          {/* History */}
          <div className="mt-10 bg-gray-50 p-6 rounded-lg">

            <h2 className="text-2xl font-bold mb-6">
              Analysis History
            </h2>

            {
              filteredHistory.length === 0 ? (

                <p className="text-gray-500">
                  No analysis history found.
                </p>

              ) : (

                <div className="space-y-4">

                  {
                    filteredHistory.map((item) => (

                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-lg shadow border"
                      >

                       <div className="flex justify-between items-center">

  <div>

    <h3 className="font-bold text-lg">
      {item.filename}
    </h3>

    <p className="text-gray-600">
      ATS Score: {item.ats_score}%
    </p>

  </div>

  <div className="flex items-center gap-4">

    <div className="text-sm text-gray-400">

      {
        new Date(
          item.created_at
        ).toLocaleString()
      }

    </div>

    <button
      onClick={() =>
        deleteAnalysis(item.id)
      }
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
    >
      Delete
    </button>

  </div>

</div> 

                      </div>

                    ))
                  }

                </div>

              )
            }

          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard
