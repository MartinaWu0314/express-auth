const { User } = require('./models')
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express()
const SECRET = 'shengchengtokenhahahah'
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/users',async (req, res)=>{
    const users = await User.find()
    res.send(users)
})

app.post('/api/register',async (req, res)=>{
    const user = await User.create({
        username: req.body.username,
        password: req.body.password
    })
    res.send(user)
})

app.post('/api/login',async (req, res)=>{
    const user = await User.findOne({
        username: req.body.username
    })
    if(!user){
        return res.status(422).send({
            message: '用户名不存在'
        })
    }
    const isPasswordValid = require('bcryptjs').compareSync(
        req.body.password,
        user.password
    )
    if(!isPasswordValid){
        return res.status(422).send({
            message: '密码无效'
        })
    }
    //生成token
    const token = jwt.sign({
        id: String(user._id),
    }, SECRET)
    res.send({
        user,
        token
    })
})

//将验证token部分的代码写成中间件（中间件是一个函数），这样可以在不同的地方复用
const auth = async (req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop()
    const { id } = jwt.verify(raw, SECRET)
    req.user = await User.findById(id)
    next()
}

app.get('/api/profile', auth, async (req, res) => {
    res.send(req.user)
})

app.listen('3001',()=>{
    console.log('http://localhost:3001')
})