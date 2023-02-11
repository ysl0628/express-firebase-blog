var express = require('express')
var router = express.Router()
const firebaseAdminDb = require('../connection/firebase-admin')

const dataRef = firebaseAdminDb.ref()
dataRef.once('value', (snapshot) => {
  // console.log(snapshot.val())
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/post', function (req, res, next) {
  res.render('post', { title: 'Express' })
})

module.exports = router
