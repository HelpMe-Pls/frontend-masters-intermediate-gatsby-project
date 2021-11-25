module.exports = {
	siteMetadata: {
		title: 'Gatsby Theme Shared Nav',
		navItems: [
			{
				label: 'Home',
				path: '/',
			},
		],
	},
	plugins: [
		{
			resolve: 'gatsby-plugin-layout',
			options: {
				component: require.resolve(
					__dirname + '/src/components/layout.js',
				), // {__dirname} is to make sure it uses gatsby-theme-shared-nav's theme
			},
		},
	],
};
