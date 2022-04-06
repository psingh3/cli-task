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

async function getTheLatestPosts(posts, size) {
	let items;
	if (posts && posts.length) {
		items = posts.slice(0, size);
	}
	return items;
}

(async () => {
	const pool = await poolConnect();

	let posts = await newsapi.v2.everything({
		q: 'tesla',
		language: 'en',
		sortBy: 'relevancy',
		page: 1,
	});

	if (posts && posts.length) {
		let latestPosts = await getTheLatestPosts(posts, 3);
		for (var post of latestPosts) {
			let postObj = {
				headline: post.title,
				body: post.description,
			};
			await savePost(pool, postObj);
		}
	}

	await pool.end();
})();
