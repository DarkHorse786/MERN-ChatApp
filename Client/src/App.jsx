import "./App.css";
import { Routes,Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function App() {
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/login" element={<LoginPage/>} />
      </Routes>
    </div>
  );
}

export default App;

