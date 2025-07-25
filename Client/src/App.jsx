import "./App.css";
import { Navigate, Routes,Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import {Toaster} from "react-hot-toast";
import { useContext } from "react";
import { authContext } from "./context/AuthContext.jsx";
import bgImage from "./assets/bgImage.svg";

function App() {
  const {authUser} = useContext(authContext);
  return (
    <div className="bg-contain min-h-screen" style={{ backgroundImage: `url(${bgImage})` }}>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={authUser? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path="/profile" element={authUser? <ProfilePage/> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser? <LoginPage/> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

