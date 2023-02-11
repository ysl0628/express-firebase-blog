const express = require('express')
const router = express.Router()
const firebaseAdminDb = require('../connection/firebase-admin')

const categoriesRef = firebaseAdminDb.ref('categories')

/* GET users listing. */
router.get('/article/create', function (req, res, next) {
  categoriesRef.once('value', (snapshot) => {
    const categories = snapshot.val()
    res.render('dashboard/article', { title: 'Express', categories })
  })
})

router.get('/archives', function (req, res, next) {
  res.render('dashboard/archives', { title: 'Express' })
})

router.get('/categories', function (req, res, next) {
  const messages = req.flash('info')
  const errorMessages = req.flash('error')
  console.log(messages)
  categoriesRef.once('value', (snapshot) => {
    const categories = snapshot.val()
    res.render('dashboard/categories', {
      title: '分類',
      categories,
      messages,
      errorMessages,
      hasInfo: messages.length > 0 || errorMessages.length > 0,
    })
  })
})

router.post('/categories/create', (req, res) => {
  const data = req.body
  const categoryRef = categoriesRef.push()
  const key = categoryRef.key
  const category = {
    ...data,
    id: key,
  }
  categoriesRef
    .orderByChild('path')
    .equalTo(data.path)
    .once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('error', '路徑已存在，請重新輸入')
        res.redirect('/dashboard/categories')
      } else {
        categoryRef.set(category).then(() => {
          res.redirect('/dashboard/categories')
        })
      }
    })
})

router.post('/categories/delete/:id', (req, res) => {
  const id = req.params.id
  categoriesRef.child(id).remove()
  req.flash('info', '已刪除分類')
  res.redirect('/dashboard/categories')
})

router.get('/signup', function (req, res, next) {
  res.render('dashboard/signup', { title: 'Express' })
})
module.exports = router
