import { config } from 'dotenv';
config();
import app from './app.js';
import connectToDB from './config/dbConnection.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectToDB();
    console.log(`App is listening at http://localhost:${PORT}`);
})