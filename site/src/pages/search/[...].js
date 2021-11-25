import * as React from 'react';
import { navigate } from 'gatsby';

import { form, input, button } from '../../styles/search.module.css';
import fetch from 'node-fetch';

export default function SearchClientOnly({ params }) {
	// {params} is the route for whatever got searched, kinda like an endpoint: https://mysite/search/{params}
	const query = decodeURIComponent(params['*']); // to make it easier to read the URL, like http://mysite/search/my-params, not http://mysite/search/my%20params
	const [currentQuery, setCurrentQuery] = React.useState(query);
	const [result, setResult] = React.useState(null);
	const [status, setStatus] = React.useState('IDLE');

	function handleSearch(event) {
		event.preventDefault();

		const form = new FormData(event.target); // to get all of the form's input, https://developer.mozilla.org/en-US/docs/Web/API/FormData
		const query = form.get('search'); // 'search' is the *name* attribute of the <input> element ==> form.get('search') to get the VALUE of it (whatever the user typed)

		setCurrentQuery(query);

		// so that it won't break the URL in case there're special characters in the query
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
		navigate(`/search/${encodeURIComponent(query)}`);
	}

	function handleSearchReset() {
		setCurrentQuery('');
		navigate('/search/');
	}

	async function bookSearch(query) {
		setStatus('LOADING');
		const res = await fetch(
			`https://openlibrary.org/search.json?q=${query}`,
		);

		if (!res.ok) {
			throw new Error(`Search failed: ${res.status}`);
		}

		const result = await res.json();

		setResult(result);
		setStatus('IDLE');
	}

	React.useEffect(() => {
		if (currentQuery === '') {
			setResult(null);
			return;
		}

		bookSearch(currentQuery);
	}, [currentQuery]);

	return (
		<>
			<h1>Search for a Book</h1>
			<form className={form} onSubmit={handleSearch}>
				<input className={input} type="search" name="search" />
				<button className={button}>search</button>
				<button
					className={button}
					type="reset"
					onClick={handleSearchReset}
				>
					reset
				</button>
			</form>

			{status === 'LOADING' && <p>Loading results...</p>}

			{status === 'IDLE' && currentQuery !== '' ? (
				<>
					<h2>Search results for "{currentQuery}"</h2>
					<ul>
						{result &&
							result.docs.map((doc) => (
								<li key={doc.key}>
									<strong>{doc.title}</strong>{' '}
									{doc.author_name &&
										`by ${doc.author_name?.[0]}`}
									{/* optional chaining because it doc.author_name may exist but contains no data */}
								</li>
							))}
					</ul>
				</>
			) : null}
		</>
	);
}
