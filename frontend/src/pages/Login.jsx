import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {

    const [email, setEmail] = useState("")

    const [password, setPassword] = useState("")

    const navigate = useNavigate()


    const handleLogin = async (e) => {

        e.preventDefault()

        try {

            const response = await axios.post(
                "http://127.0.0.1:8000/auth/login",
                {
                    email,
                    password
                }
            )
            // SAVE TOKEN 
            localStorage.setItem( "token", response.data.access_token )
            
            localStorage.setItem(
                "username",
                response.data.user.username
            )

            navigate("/dashboard")

        } catch (error) {

            console.log(error)

            alert("Login Failed")
        }
    }


    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleLogin}
                className="bg-white p-10 rounded-xl shadow-lg w-96"
            >

                <h1 className="text-3xl font-bold mb-6 text-center">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    className="w-full border p-3 mb-4 rounded-lg"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    className="w-full border p-3 mb-4 rounded-lg"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                    Login
                </button>

            </form>

        </div>
    )
}

export default Login