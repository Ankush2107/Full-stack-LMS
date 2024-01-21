import './App.css';

import { Route, Routes } from 'react-router-dom';

import AboutUsPage from './pages/AboutUsPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage />} ></Route>
          <Route path="/about" element={<AboutUsPage />} ></Route>
        </Routes>
    </>
  )
}
export default App;