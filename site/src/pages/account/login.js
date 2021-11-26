import * as React from 'react';
import { navigate } from 'gatsby';

async function checkLogin(setLoginStatus) {
	const { loggedIn = false } = await fetch('/api/check-auth').then((res) =>
		res.json(),
	);

	setLoginStatus(loggedIn);
}

async function login() {
	const { status } = await fetch('/api/login').then((res) => res.json());

	if (status !== 'ok') {
		throw new Error(status);
	}

	navigate('/account/dashboard');
}

export default function LoginPage() {
	const [loginStatus, setLoginStatus] = React.useState();

	React.useEffect(() => {
		checkLogin(setLoginStatus);
	}, []);

	if (loginStatus === true) {
		navigate('/account/dashboard', { replace: true });
		// {replace: true} is used to prevent the browser from adding an unavailible route to the browser's history.
		// https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/#replace-history-during-programmatic-navigation
		return null;
	}

	return <button onClick={login}>Login</button>;
}
