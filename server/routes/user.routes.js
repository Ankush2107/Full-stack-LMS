import { Router } from 'express';
import { getProfile, loginUser, logoutUser, registerUser, forgotPassword, resetPassword, changePassword, updateUser } from '../controllers/user.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/register', upload.single("avatar"), registerUser);

router.post('/login', loginUser);

router.get('/logout', logoutUser);

router.get('/me', isLoggedIn, getProfile);

router.post('/reset', forgotPassword);

router.post('/reset:resetToken', resetPassword);

router.post('/change-password',isLoggedIn,  changePassword);

router.put('/update/:id', isLoggedIn, upload.single("avatar"), updateUser);


export default router;