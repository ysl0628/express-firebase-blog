const express = require('express')
const router = express.Router()
const firebaseAdminDb = require('../connection/firebase-admin')

const categoriesRef = firebaseAdminDb.ref('/categories/')

/* GET users listing. */
router.get('/article', function (req, res, next) {
  res.render('dashboard/article', { title: 'Express' })
})

router.get('/archives', function (req, res, next) {
  res.render('dashboard/archives', { title: 'Express' })
})

router.get('/categories', function (req, res, next) {
  res.render('dashboard/categories', { title: 'Express' })
})

router.post('/categories/create', (req, res) => {
  const data = req.body
  const categoryRef = categoriesRef.push()
  const key = categoryRef.key
})

router.get('/signup', function (req, res, next) {
  res.render('dashboard/signup', { title: 'Express' })
})
module.exports = router
