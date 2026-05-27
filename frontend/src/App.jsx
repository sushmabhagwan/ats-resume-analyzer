import { useState } from "react"
import axios from "axios"

function App() {

  const [file, setFile] = useState(null)

  const [jobDescription, setJobDescription] = useState("")

  const [loading, setLoading] = useState(false)

  const [result, setResult] = useState(null)


  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!file || !jobDescription) {
      alert("Please upload resume and enter job description")
      return
    }

    const formData = new FormData()

    formData.append("file", file)

    formData.append("job_description", jobDescription)

    try {

      setLoading(true)

      const response = await axios.post(
        "http://127.0.0.1:8000/analysis/ai-suggestions",
        formData
      )

      setResult(response.data)

    } catch (error) {

      console.error(error)

      alert("Error analyzing resume")

    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          ATS Resume Analyzer
        </h1>


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div>

            <label className="block text-lg font-semibold mb-2">
              Upload Resume
            </label>

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-300 p-3 rounded-lg"
            />

          </div>


          <div>

            <label className="block text-lg font-semibold mb-2">
              Job Description
            </label>

            <textarea
              rows="8"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-gray-300 p-4 rounded-lg"
              placeholder="Paste job description here..."
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >

            {
              loading ? (

                <div className="flex items-center justify-center gap-3">

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


        {
          result && (

            <div className="mt-10 space-y-6">


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
                      {result.ats_analysis.ats_score}%
                    </span>

                  </div>


                  <div className="w-full bg-gray-300 rounded-full h-5">

                    <div
                      className="bg-blue-600 h-5 rounded-full"
                      style={{
                        width: `${result.ats_analysis.ats_score}%`
                      }}
                    />

                  </div>

                </div>


                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-white p-4 rounded-lg shadow">

                    <p className="text-gray-500">
                      Similarity Score
                    </p>

                    <p className="text-2xl font-bold">
                      {result.ats_analysis.similarity_score}
                    </p>

                  </div>


                  <div className="bg-white p-4 rounded-lg shadow">

                    <p className="text-gray-500">
                      Skill Match Ratio
                    </p>

                    <p className="text-2xl font-bold">
                      {result.ats_analysis.skill_match_ratio}%
                    </p>

                  </div>

                </div>

              </div>


              <div className="bg-green-50 p-6 rounded-lg">

                <h2 className="text-2xl font-bold mb-4 text-green-700">
                  Matched Skills
                </h2>

                <div className="flex flex-wrap gap-2">

                  {
                    result.ats_analysis.matched_keywords.map((skill, index) => (

                      <span
                        key={index}
                        className="bg-green-200 text-green-800 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>

                    ))
                  }

                </div>

              </div>


              <div className="bg-red-50 p-6 rounded-lg">

                <h2 className="text-2xl font-bold mb-4 text-red-700">
                  Missing Skills
                </h2>

                <div className="flex flex-wrap gap-2">

                  {
                    result.ats_analysis.missing_keywords.map((skill, index) => (

                      <span
                        key={index}
                        className="bg-red-200 text-red-800 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>

                    ))
                  }

                </div>

              </div>


              <div className="bg-blue-50 p-6 rounded-lg">

                <h2 className="text-2xl font-bold mb-4 text-blue-700">
                  AI Suggestions
                </h2>

                <pre className="whitespace-pre-wrap text-gray-800">
                  {result.ai_suggestions}
                </pre>

              </div>

            </div>

          )
        }

      </div>

    </div>

  )
}

export default App