require('dotenv').config()
const cors = require('cors'); // Import the cors package
const express = require('express')
const mongoose = require('mongoose')

const pozRoutes = require('./routes/pozlar')
const userRoutes = require('./routes/user')
const firmaRoutes = require('./routes/firmalar')
const projeRoutes = require('./routes/projeler')
const mahalRoutes = require('./routes/mahaller')
const dugumRoutes = require('./routes/dugumler')
const versiyonRoutes = require('./routes/versiyon')





// express app
const app = express()

// middleware
app.use(express.json())


app.use(cors({
  origin: ['http://localhost:3000','https://rapor724.vercel.app'], // Allow requests from your client
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));


app.use((req, res, next) => {
  console.log(req.path, req.method)
  // res.header('Access-Control-Allow-Origin', req.headers.origin);
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  // res.header("Access-Control-Allow-Headers", "*");
  // res.header('Access-Control-Allow-Credentials', true);
  // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next()
})


// routes
app.use('/api/pozlar', pozRoutes)
app.use('/api/user', userRoutes)
app.use('/api/firmalar', firmaRoutes)
app.use('/api/projeler', projeRoutes)
app.use('/api/mahaller', mahalRoutes)
app.use('/api/dugumler', dugumRoutes)
app.use('/api/versiyon', versiyonRoutes)



// mongoose.set('strictQuery', true)

// connect to db
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to database')
    // listen to port
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT)
    })
  })
  .catch((err) => {
    console.log(err)
  }) 