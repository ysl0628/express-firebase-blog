const dayjs = require('dayjs')
var express = require('express')
const striptags = require('striptags')
var router = express.Router()
const firebaseAdminDb = require('../connection/firebase-admin')

const categoriesRef = firebaseAdminDb.ref('categories')
const articlesRef = firebaseAdminDb.ref('articles')

/* GET home page. */
router.get('/', function (req, res, next) {
  const currentPage = req.query.page || 1
  let categories = {}
  categoriesRef // 使用 promise 而非 callback
    .once('value')
    .then((snapshot) => {
      categories = snapshot.val()
      return articlesRef.orderByChild('update_time').once('value')
    })
    .then((snapshot) => {
      let articles = []
      snapshot.forEach((child) => {
        if ('public' === child.val().status) {
          articles.push(child.val())
        }
      })
      articles.reverse()

      // pagination
      const totalCount = articles.length
      const pageLimit = 3
      const pages = Math.ceil(totalCount / pageLimit) // 總頁數

      const minItem = currentPage * pageLimit - pageLimit + 1
      const maxItem = currentPage * pageLimit
      const data = []
      articles.forEach((item, i) => {
        let itemNum = i + 1
        if (itemNum >= minItem && itemNum <= maxItem) {
          data.push(item)
        }
      })

      const pagination = {
        totalCount,
        currentPage: currentPage > pages ? pages : currentPage,
        pages,
        hasPre: currentPage > 1,
        hasNext: currentPage < pages,
      }

      res.render('index', {
        title: '文章列表',
        dayjs,
        article: data,
        pagination,
        striptags,
        categories,
      })
    })
})

router.get('/post/:id', function (req, res, next) {
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
      res.render('post', {
        title: '文章',
        dayjs,
        article,
        categories,
      })
    })
})

router.get('/post', function (req, res, next) {
  res.render('post', { title: 'Express' })
})

module.exports = router
