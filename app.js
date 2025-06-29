import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes.js'
import groupRoutes from './routes/groupRoutes.js'


const app = express()
const port = 3000

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api/groups', groupRoutes);



app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})