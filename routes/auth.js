const firebaseDb = require('../connection/firebase')
const firebaseAdminDb = require('../connection/firebase-admin')
const express = require('express')
const router = express.Router()
const firebaseAuth = firebaseDb.auth()
require('dotenv').config()

router.get('/signup', (req, res) => {
  const error = req.flash('error')
  const hasError = error.length > 0
  res.render('dashboard/signup', { error, hasError })
})

router.get('/signin', function (req, res, next) {
  const error = req.flash('error')
  const hasError = error.length > 0
  res.render('dashboard/signin', { error, hasError })
})

router.get('/signout', (req, res) => {
  firebaseAuth
    .signOut()
    .then((user) => {
      // 建立登入權限
      req.session.uid = null
      res.redirect('/auth/signin')
    })
    .catch((error) => {
      const errorMessage = error.message
      req.flash('error', errorMessage)
      res.redirect('/auth/signin')
    })
})

router.post('/signup', (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirm_password = req.body.confirm_password

  if (password !== confirm_password) {
    req.flash('error', '兩個密碼輸入不相同')
    res.redirect('/auth/signup')
  } else {
    firebaseAuth
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        const saveUser = {
          email: email,
          uid: user.user.uid,
        }
        firebaseAdminDb.ref('users/' + user.user.uid).set(saveUser)
        res.redirect('/auth/signin')
      })
      .catch((error) => {
        const errorMessage = error.message
        req.flash('error', errorMessage)
        res.redirect('/auth/signup')
      })
  }
})

router.post('/signin', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  firebaseAuth
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      // 建立登入權限
      if (user.user.uid !== process.env.ADMIN_USER) {
        req.flash('error', '權限不足，請與管理員聯絡')
        return res.redirect('/auth/signin')
      }
      req.session.uid = user.user.uid
      res.redirect('/dashboard')
    })
    .catch((error) => {
      const errorMessage = error.message
      req.flash('error', errorMessage)
      res.redirect('/auth/signin')
    })
})

module.exports = router
