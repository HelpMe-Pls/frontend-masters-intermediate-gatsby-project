export default function handler(_req, res) {
	res.json({
		GATSBY_PUBLIC_VALUE: process.env.GATSBY_PUBLIC_VALUE,
		SECRET_VALUE: process.env.SECRET_VALUE,
	});
}

// serverless functions give the privilege to work with private values
// visit: https://github.com/netlify/explorers to see how they work IRL
