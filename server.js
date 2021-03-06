const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: {
		  rejectUnauthorized: false
		}
	}
  });

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.json('success');
})

app.post('/signIn', (req, res) => {
	const { email, password } = req.body;
	db.select('email', 'hash').from('login').where({
		email: email
	})
	.then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if(isValid) {
			return db.select('*').from('users').where({
				email: email
			}).then(user => {
				res.json(user[0]);
			}).catch(err => res.status(400).json("unable to get user"));
		} else {
			res.status(400).json("wrong credentials");
		}	
	}).catch(err => res.status(400).json("wrong credentials"));
})

app.post('/register', (req, res) => {
	const data = req.body;
	const { name, email, password } = data;
	var hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		}).into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users').returning('*').insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			}).then(user => {
				res.json(user[0]);
			})
		}).then(trx.commit)
		.catch(trx.rollback)
	}).catch(err => res.status(400).json("unable to register"));
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({
		id: id
	}).then(user => {
		if(user.length!=0) {
			res.json(user[0]);
		} else {
			res.status(400).json("user not found");
		}
	})
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where({
		id: id
	}).increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	}).catch(err => res.status(400).json("unable to get entries"));
})

app.listen(process.env.PORT || 3001, () => {
	console.log(`app running on port ${process.env.PORT}`);
})