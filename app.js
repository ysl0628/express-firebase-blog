const path = require('path')
const flash = require('connect-flash')
const logger = require('morgan')
const express = require('express')
const session = require('express-session')
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const firebaseAdminDb = require('./connection/firebase-admin')

require('dotenv').config()

const authRouter = require('./routes/auth')
const indexRouter = require('./routes/index')
const dashboardRouter = require('./routes/dashboard')

const categoriesRef = firebaseAdminDb.ref('categories')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', require('express-ejs-extend'))
app.set('view engine', 'ejs')

app.use(flash())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(
  session({
    secret: 'wakanda',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
)
// 以 middleware 檢查是否登入
const globalLocals = (err, req, res, next) => {
  console.log('globalLocals')
  res.locals.user = req.session.uid || null
  categoriesRef.once('value', (snapshot) => {
    res.locals.categories = snapshot.val()
  })
  next()
}

// check login
const authCheck = (req, res, next) => {
  if (req.session.uid === process.env.ADMIN_USER) {
    // 要加 return
    return next()
  }
  res.redirect('/auth/signin')
}

app.use('/', globalLocals, indexRouter)
app.use('/auth', authRouter)
app.use('/dashboard', authCheck, dashboardRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log('here')
  categoriesRef.once('value', (snapshot) => {
    res.locals.categories = snapshot.val()
    createError(404)
    res.render('error', { title: '您所查看的頁面不存在' })
  })
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', { title: '您所查看的頁面不存在' })
})

module.exports = app
