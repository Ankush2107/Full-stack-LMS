import { Router } from "express";
import { getAllCourses, getLecturesByCourseId, updateCourse, createCourse, removeCourse, addLectureToCourseById } from "../controllers/course.controller.js";
import { authorisedSubscriber, authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from '../middlewares/multer.middleware.js'

const router = Router();

router.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
    );
    
router.route('/:id')
    .get(
        isLoggedIn,
        authorisedSubscriber,
        getLecturesByCourseId
    )
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        removeCourse
    )
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('lecture'),
        addLectureToCourseById
    );

export default router;