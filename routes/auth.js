const firebaseDb = require('../connection/firebase')
const express = require('express')
const router = express.Router()
const firebaseAuth = firebaseDb.auth()

router.get('/signup', (req, res) => {
  const error = req.flash('error')
  res.render('dashboard/signup', { error })
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
        firebaseDb.ref('users/' + user.user.uid).set(saveUser)
        res.redirect('/dashboard')
      })
      .catch((error) => {
        const errorMessage = error.message
        req.flash('error', errorMessage)
        res.redirect('/auth/signup')
      })
  }
})

module.exports = router
