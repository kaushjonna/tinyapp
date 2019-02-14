const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
	b2xVn2: 'http://www.lighthouselabs.ca',
	'9sm5xK': 'http://www.google.com',
};

const users = {
	001: {
		id: 001,
		email: 'test',
		password: 'test',
	},
	asasdfasd: {
		id: 'asdfadsf',
		email: 'test2',
		password: 'test2',
	},
};

app.get('/', (req, res) => {
	res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
	const templateVars = {
		urls: urlDatabase,
		user: users[req.cookies.username],
	};
	res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
	const templateVars = {
		user: users[req.cookies.username],
	};
	res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
	console.log(req.body);
	const shortUrl = generateRandomString();
	urlDatabase[shortUrl] = req.body.longURL;
	res.redirect(`/urls/${shortUrl}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
	delete urlDatabase[req.params.shortURL];
	res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
	urlDatabase[req.params.shortURL] = req.body.longURL;
	res.redirect('/urls');
});

// app.post('/login', (req, res) => {
// 	res.cookie('username', req.body.username);
// 	res.redirect('/urls');
// });

app.post('/logout', (req, res) => {
	res.clearCookie('username');
	res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
	const templateVars = {
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL],
		user: users[req.cookies.username],
	};
	res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
	const longURL = urlDatabase[req.params.shortURL];
	res.redirect(longURL);
});

app.get('/hello', (req, res) => {
	const templateVars = { greeting: 'Hello World!' };
	res.render('hello_world', templateVars);
});

app.get('/register', (req, res) => {
	const templateVars = {};
	res.render('login_registration', templateVars);
});

app.get('/login', (req, res) => {
	const templateVars = {};
	res.render('login', templateVars);
});

app.post('/login', (req, res) => {
	if (req.body.password === getCreds(req.body.email)[0]) {
		res.cookie('username', getCreds(req.body.email)[1]);
		res.redirect('/urls');
	}
});

app.post('/register', (req, res) => {
	if (req.body.email == '' || req.body.password == '' || checkForEmailDup(req.body.email)) {
		res.status('400').send('unfilled options');
		console.log('error');
	} else {
		let randomId = generateRandomString();
		users[randomId] = {};
		users[randomId]['id'] = randomId;
		users[randomId]['email'] = req.body.email;
		users[randomId]['password'] = req.body.password;

		res.cookie('username', randomId);
		res.redirect('/urls');
	}
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
	let randomString = '';
	let randomNum = 0;
	const charOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < 6; i++) {
		randomNum = Math.floor(Math.random() * Math.floor(charOptions.length));
		randomString += charOptions[randomNum];
	}
	return randomString;
}

function checkForEmailDup(email) {
	var isDuplicate = false;
	for (let i in users) {
		if (email === users[i]['email']) {
			isDuplicate = true;
		}
	}
	return isDuplicate;
}

function getCreds(email) {
	for (let i in users) {
		if (email === users[i]['email']) {
			console.log(users[i].password);
			return [users[i].password, i, users[i].email];
		}
	}
}

console.log(users);
