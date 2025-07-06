import React, { useContext, useState } from "react";
import assets, { userDummyData } from "../assets/assets.js";
import { authContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  // login and signup handler
  const {login} = useContext(authContext);

  const onSubmitHandler = (e)=>{
    e.preventDefault();
    if(currState === 'Sign up' && !isDataSubmitted ){
      setIsDataSubmitted(true);
      return;
    }
    login(currState=== "Sign up" ? "signup" : "login", {
      fullName: currState === "Sign up" ? fullName : "",
      email,
      password,
      bio: currState === "Sign up" ? bio : "",})
    }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* -------- left -------- */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />

      {/* -------- right -------- */}
      <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && 
          <img src={assets.arrow_icon} alt="" className="w-5 cursor-pointer" onClick={()=>setIsDataSubmitted(false)} />
        }
        </h2>
        

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email Address"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide a short Bio..."
            value={bio}
            rows={5}
            onChange={(e) => setBio(e.target.value)}
          />
        )}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign up" ? "Create Account" : "Login"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy.</p>
        </div>

        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?
              <span
                className="font-medium text-violet-500 cursor-pointer"
                onClick={() => setCurrState("Login")}
              >
                {" "}
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Don't have account?
              <span
                className="font-medium text-violet-500 cursor-pointer"
                onClick={() => setCurrState("Sign up")}
              >
                {" "}
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
