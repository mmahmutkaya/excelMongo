require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const pozRoutes = require('./routes/pozlar')
const userRoutes = require('./routes/user')



// express app
const app = express()

// middleware
app.use(express.json())


app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/pozlar', pozRoutes)
app.use('/api/user', userRoutes)

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