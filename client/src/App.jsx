import './App.css';

import { Route, Routes } from 'react-router-dom';

import AboutUsPage from './pages/AboutUsPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage />} ></Route>
          <Route path="/about" element={<AboutUsPage />} ></Route>
          <Route path="/*" element={<NotFound />} ></Route>
        </Routes>
    </>
  )
}
export default App;