// import "./App.css";
// import { Routes,Route } from "react-router-dom";
// import HomePage from "./pages/HomePage.jsx";
// import ProfilePage from "./pages/ProfilePage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";

// function App() {
//   return (
//     <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain min-h-screen">
//       <Routes>
//         <Route path="/" element={<HomePage/>} />
//         <Route path="/profile" element={<ProfilePage/>} />
//         <Route path="/login" element={<LoginPage/>} />
//       </Routes>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </nav>

        <div className="p-8">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

