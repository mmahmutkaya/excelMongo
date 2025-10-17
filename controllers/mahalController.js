const Poz = require('../models/pozModel')
const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')

const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;




const createMahal = async (req, res) => {

  const hataBase = "BACKEND - (createMahal) - "

  const {
    email: userEmail,
    isim: userIsim,
    soyisim: userSoyisim
  } = JSON.parse(req.user)

  let { newMahal } = req.body
  
  try {



  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}





// const createMahal = async (req, res) => {

//   const hataBase = "BACKEND - (createMahal) - "

//   const {
//     email: userEmail,
//     isim: userIsim,
//     soyisim: userSoyisim
//   } = JSON.parse(req.user)

//   let { newMahal } = req.body


//   try {


    
//   } catch (error) {
//     res.status(400).json({ error: hataBase + error })
//   }

// }






module.exports = {

  createMahal

}