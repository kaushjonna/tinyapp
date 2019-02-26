//importing required modules from npm
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

//setting up the usage of the dependancies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'testApp',
  signed: true,
}));

app.set('view engine', 'ejs');

//Database Objects
//url database
const urlDatabase = {
  'b2xVn2': { url: 'http://www.lighthouselabs.ca', user: 'abcd' },
  '9sm5xK': { url: 'http://www.google.com', user: 'user2' }
};

//user database
const users = {
  abcd: {
    id: 'abcd',
    email: 'test@test.com',
    password: 'test',
  },
  user2: {
    id: 'user2',
    email: 'test2@test.com',
    password: 'test2',
  },
};

//Server Handlers
//Page Directs

//Main Home Page
app.get('/', (req, res) => {
  if (!req.session.username) {
    res.redirect('/login?alert=true');
  } else {
    res.redirect('/urls');
  }
});

//url Database API
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// urls page
app.get('/urls', (req, res) => {

  console.log("check: ", req.session.username);
  if (!req.session.username) {
    res.redirect('/login?alert=true');
  }
  const currUser = req.session.username;
  console.log(currUser);
  if (currUser) {

    var userEmail = users[currUser].email;
    var userBase = getUrls(currUser);
    console.log('userbase: ', userBase);
  } else {
    var userEmail = "";
  }
  const templateVars = {
    user: userEmail,
    urls: userBase,
  };
  console.log('email:', userEmail);
  res.render('urls_index', templateVars);
});

// create new url
app.get('/urls/new', (req, res) => {
  if (!req.session.username) {
    res.redirect('/login?alert=true');
  }
  const username = users[req.session.username].email;
  console.log('new: ', username);
  const templateVars = {
    user: username,
  };
  console.log(username);
  res.render('urls_new', templateVars);
});

// Url Edit page
app.get('/urls/:shortURL', (req, res) => {
  if (req.session.username && urlDatabase[req.params.shortURL].user === req.session.username) {
    const templateVars = {
      user: users[req.session.username].email,
      short: req.params.shortURL,
      long: urlDatabase[req.params.shortURL].url
    };
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/login?alert=true')
  }
});

// Register page
app.get('/register', (req, res) => {
  const templateVars = {
    user: false,
  };
  res.render('login_registration', templateVars);
});

// Login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: '',
    alert: req.query.alert,
  };
  res.render('login', templateVars);
});

//Redirect
app.get('/u/:shortURL', (req, res) => {
  const short = req.params.shortURL;
  const long = urlDatabase[short].url;
  res.redirect(long);
});

// POST Handlers
//Register Post, creates a user and stores it in the database. proceeds to redirect to login page.
app.post('/register', (req, res) => {
  const genId = userID();
  users[genId] = {};
  users[genId].id = genId;
  users[genId].email = req.body.email;
  users[genId].password = bcrypt.hashSync(req.body.password, 10);
  console.log('users: ', users)
  res.redirect('/login');
});

//Login Post verifies password and sets session cookie upon successful login.
app.post('/login', (req, res) => {
  const user = getID(req.body.email);
  console.log('login: ', user[0]);
  if (bcrypt.compareSync(req.body.password, users[user[0]].password)) {
    req.session.username = user[0];
    console.log('success!', req.session.username);
  }
  res.redirect('/urls');
});

//Logout Post, destroys session and redirects page.
app.post('/logout', (req, res) => {
  req.session = null;
  console.log('Logout!');
  res.redirect('/urls');
});

//Creates new shortURL POST
app.post('/urls', (req, res) => {
  if (req.session.username) {
    console.log(`${req.session.username} is logged in`);
    const shortCode = userID();
    console.log(shortCode);
    urlDatabase[shortCode] = { url: req.body.longURL, user: req.session.username };
    console.log('url:', urlDatabase[shortCode]);
    res.redirect('/urls');
  } else {
    res.redirect('/login?alert=true');
  }
});

//Edits existing URL POST 
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].url = req.body.longURL;
  res.redirect('/urls')
});


//Deletes existing url
app.post('/urls/:shortURL/delete', (req, res) => {

  if (req.session.username) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login?alert=true');
  }
});

//Spin up server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`)
});

//Helper Functions
//used to create unique id
const userID = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

//used to check for id with email, returns an array with id and email upon find. if the id does not exist, returns false.
const getID = (email) => {
  for (let i in users) {
    if (email === users[i].email) {
      console.log(`found at ${i}`)
      return [users[i].id, users[i].email];
    }
  }
  return false;
};

//returns the urls registered to user given userid
const getUrls = (user) => {
  const userBase = {};
  for (let i in urlDatabase) {
    if (user === urlDatabase[i].user) {
      userBase[i] = urlDatabase[i].url;
    }
  }
  return userBase;
};