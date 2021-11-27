module.exports = {
	siteMetadata: {
		title: 'My Book Club',
		navItems: [
			// Adding selections to the navbar (of the theme)
			{
				label: 'Books',
				path: '/books',
			},
			{
				label: 'Authors',
				path: '/authors',
			},
			{
				label: 'Account',
				path: '/account',
			},
		],
	},
	plugins: [
		'gatsby-plugin-image',
		'gatsby-plugin-sharp',
		'gatsby-transformer-sharp',
		'gatsby-theme-shared-nav', // OUR theme works because we added it HERE
		'gatsby-plugin-netlify',
	],
};
