import './App.css';

import { Route, Routes } from 'react-router-dom';

import RequireAuth from './components/Auth/RequireAuth';
import AboutUsPage from './pages/AboutUsPage';
import Contact from './pages/Contact';
import CourseDescription from './pages/Course/CourseDescription';
import CourseList from './pages/Course/CourseList';
import CreateCourse from './pages/Course/CreateCourse';
import Denied from './pages/Denied';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import Profile from './pages/User/Profile';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage />} ></Route>
          <Route path="/about" element={<AboutUsPage />} ></Route>
          <Route path='/courses' element={<CourseList/>}></Route>
          
          <Route path='/signup' element={<Signup/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/contact' element={<Contact/>} ></Route>
          <Route path='/denied' element={<Denied/>}></Route>
          <Route path='/course/description' element={<CourseDescription/>}></Route>


          <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
            <Route path='/course/create' element={<CreateCourse/>}></Route>
          </Route>

          <Route element={<RequireAuth allowedRoles={["ADMIN", "USER"]} />}>
          <Route path="/user/profile" element={<Profile />}/>
          <Route path="/user/editprofile" element={<EditProfile />}/>
          </Route>

          <Route path="*" element={<NotFound />} ></Route>
        </Route>


        </Routes>
    </>
  )
}
export default App;