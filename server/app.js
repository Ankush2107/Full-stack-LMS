import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
const app = express();

// middleware
app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', (req, res) => {
    res.send('Pong');
})

// routes of 3 modules
app.use('/api/v1/users', userRoutes);
app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found')
})

export default app;