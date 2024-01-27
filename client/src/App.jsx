import './App.css';

import { Route, Routes } from 'react-router-dom';

import AboutUsPage from './pages/AboutUsPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import Signup from './pages/signUp';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage />} ></Route>
          <Route path="/about" element={<AboutUsPage />} ></Route>
          <Route path="*" element={<NotFound />} ></Route>
          <Route path='/signup' element={<Signup/>}></Route>
        </Routes>
    </>
  )
}
export default App;