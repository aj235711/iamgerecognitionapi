const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();


const database = {
	users: [
		{
			id: 100,
			name: 'John',
			email: 'john@gmail.com',
			password: 'abc',
			entries: 0,
			joined: new Date()
		},
		{ 
			id: 101,
			name: 'Sally',
			email: 'sally@gmail.com',
			password: '123',
			entries: 0,
			joined: new Date()
		}
	]
}

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.json(database.users);
})

app.post('/signIn', (req, res) => {
	const data = req.body;
	if(data.email === database.users[0].email && data.password === database.users[0].password) {
		res.json('success');
	} else {
		res.status(400).json("error logging in");
	}
})

app.post('/register', (req, res) => {
	const data = req.body;
	const { users } = database;
	const { name, email, password } = data;
	users.push({
		id: 102,
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date()
	})
	res.json(users[users.length - 1]);
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	database.users.forEach((user) => {
		if (id == user.id) {
			found = true;
			return res.json(user);
		}
	})
	if (!found) {
		res.status(400).json("Could not find user");
	}
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	let found = false;
	database.users.forEach((user) => {
		if (id == user.id) {
			found = true;
			user.entries++;
			return res.json(user.entries);
		}
	})
	if (!found) {
		res.status(400).json("Could not find user");
	}
})

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3001, () => {
	console.log("app running on port 3001");
})