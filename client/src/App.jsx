import './App.css';

import { Route, Routes } from 'react-router-dom';

import AboutUsPage from './pages/AboutUsPage';
import CourseList from './pages/Course/CourseList';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage />} ></Route>
          <Route path="/about" element={<AboutUsPage />} ></Route>
          <Route path='/courses' element={<CourseList/>}></Route>
          <Route path="*" element={<NotFound />} ></Route>
          <Route path='/signup' element={<Signup/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
        </Routes>
    </>
  )
}
export default App;