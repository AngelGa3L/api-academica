import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json())

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})