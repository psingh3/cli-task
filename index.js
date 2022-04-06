#!/usr/bin/env node

const yargs = require('yargs');
const axios = require('axios');
const { Pool, Client } = require('pg');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('65280fb593914f6a8fea7ea04f41e30c');

const options = yargs.usage('Usage: -n <name>').option('n', {
	alias: 'name',
	describe: 'Your name',
	type: 'string',
	demandOption: true,
}).argv;

const greeting = `Hello, ${options.name}!`;
console.log(greeting);

console.log("Here's a random post :");

const url = 'https://rapidapi.com/search/news';

// Data base things
const credentials = {
	user: 'postgres',
	host: 'localhost',
	database: 'clitool',
	password: '',
	port: 5432,
};

// Connect with a connection pool.
async function poolConnect() {
	const pool = new Pool(credentials);

	return pool;
}

// Save the post
async function savePost(pool, post) {
	const text = `
    INSERT INTO posts (headline, body)
    VALUES ($1, $2)
    RETURNING id
  `;
	const values = [post.headline, post.body];
	return pool.query(text, values);
}

(async () => {
	const pool = await poolConnect();

	let posts = await newsapi.v2.everything({
		q: 'tesla',
		language: 'en',
	});

	console.log('posts:', posts);
	let postObj = {
		headline: 'I am first article',
		body: 'I am body of the article',
	};
	await savePost(pool, postObj);
	await pool.end();
})();
