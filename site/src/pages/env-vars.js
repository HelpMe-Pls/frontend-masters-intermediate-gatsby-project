import * as React from 'react';

export default function EnvVarsPage() {
	return (
		<>
			<h1>Environment Variables</h1>
			<ul>
				<li>GATSBY_PUBLIC_VALUE: {process.env.GATSBY_PUBLIC_VALUE}</li>{' '}
				{/* prefix GATSBY_**** signals that it's the public value*/}
				<li>SECRET_VALUE: {process.env.SECRET_VALUE}</li>
			</ul>
		</>
	);
}
