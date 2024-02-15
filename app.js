const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const filepath = path.join(__dirname, 'userData.db')
app.use(express.json())
const bcrypt = require('bcrypt')
let db = null
const makedbconnections = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(e.message)
  }
}
makedbconnections()
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const query1 = `select * from user where username ='${username}';`
  const encryptedpassword = await bcrypt.hash(password, 10)
  const ans = await db.get(query1)
  const passlen = password.length
  let dbquery = ''
  if (ans === undefined && passlen > 5) {
    dbquery = `insert into user (username,name, password,gender,location) values
     ("${username}","${name}","${encryptedpassword}","${gender}","${location}");`
    data = await db.run(dbquery)
    response.send('User created successfully')
  } else if (ans === undefined && passlen > 5) {
    response.status(400)
    response.send('Password is too short')
  } else {
    response.status(400)
    response.send('User already exists')
  }
})
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const query1 = `select * from user where username="${username}";`
  const dbuser = await db.get(query1)
  const actualPass = await bcrypt.compare(password, dbuser.password)
  if (dbuser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    if (actualPass === true) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const query1 = `select * from user where username= "${username}";`
  const dbuser = await db.get(query1)
  const passlen = newPassword.length
  let dbquery = ''
  const actualPass = await bcrypt.compare(oldPassword, dbuser.password)
  if (actualPass === true && passlen > 5) {
    const newPass = await bcrypt.hash(newPassword, 10)
    dbquery = `update user set password ="${newPass}" where username="${username}";`
    await db.run(dbquery)
    response.send('Password updated')
  } else if (actualPass === true && passlen < 5) {
    response.status(400)
    response.send('Password is too short')
  } else if (actualPass != true) {
    response.status(400)
    response.send('Invalid current password')
  }
})
module.exports = app
