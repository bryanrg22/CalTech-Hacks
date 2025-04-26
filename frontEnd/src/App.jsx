import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import HomePage from "./pages/HomePage";
import Questionnaire from "./pages/Questionnaire";
import React from 'react'

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/Questionnaire" element={<Questionnaire />} />
    </Routes>
  </Router>
);

export default App;