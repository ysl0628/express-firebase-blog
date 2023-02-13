const dayjs = require('dayjs')
const express = require('express')
const router = express.Router()
const striptags = require('striptags')
const firebaseAdminDb = require('../connection/firebase-admin')

const categoriesRef = firebaseAdminDb.ref('categories')
const articlesRef = firebaseAdminDb.ref('articles')

/* GET article/create listing. */
router.get('/', function (req, res, next) {
  res.render('dashboard', { title: 'Express' })
})

router.get('/article/create', function (req, res, next) {
  categoriesRef.once('value', (snapshot) => {
    const categories = snapshot.val()
    res.render('dashboard/article', { title: 'Express', categories })
  })
})

/*  */
router.get('/article/:id', function (req, res, next) {
  const id = req.params.id
  let categories = {}
  categoriesRef // 使用 promise 而非 callback
    .once('value')
    .then((snapshot) => {
      categories = snapshot.val()
      return articlesRef.child(id).once('value')
    })
    .then((snapshot) => {
      const article = snapshot.val()
      console.log('article', article)
      res.render('dashboard/article', { title: 'Express', categories, article })
    })
})

router.get('/archives', function (req, res, next) {
  const status = req.query.status || 'public'
  const id = req.params.id
  let categories = {}
  let article = []
  categoriesRef // 使用 promise 而非 callback
    .once('value')
    .then((snapshot) => {
      categories = snapshot.val()
      return articlesRef.orderByChild('update_time').once('value')
    })
    .then((snapshot) => {
      snapshot.forEach((child) => {
        if (status === child.val().status) {
          article.push(child.val())
        }
      })
      article.reverse()
      res.render('dashboard/archives', {
        title: '文章列表',
        dayjs,
        status,
        article,
        striptags,
        categories,
      })
    })
})

router.get('/categories', function (req, res, next) {
  const messages = req.flash('info')
  const errorMessages = req.flash('error')
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

router.post('/article/create', function (req, res, next) {
  const data = req.body
  const articleRef = articlesRef.push()
  const key = articleRef.key
  const article = {
    ...data,
    id: key,
    update_time: Date.now().valueOf(),
  }
  articleRef.set(article).then(() => {
    res.redirect(`/dashboard/archives`)
  })
})

router.post('/article/update/:id', function (req, res, next) {
  const data = req.body
  const id = req.params.id
  const article = {
    ...data,
    update_time: Date.now().valueOf(),
  }
  console.log(article)
  articlesRef
    .child(id)
    .update(article)
    .then(() => {
      res.redirect(`/dashboard/archives`)
    })
})

router.post('/article/delete/:id', (req, res) => {
  const id = req.params.id
  articlesRef.child(id).remove()
  req.flash('info', '已刪除文章')
  res.send({ message: '成功刪除文章' })
  res.end()
})

module.exports = router
