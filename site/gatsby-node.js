exports.createPages = ({ actions }) => {
	const { createPage } = actions;
	createPage({
		path: '/custom', // The URL's endpoint for this page
		component: require.resolve('./src/templates/custom.js'),
		context: {
			title: 'A Random Page',
			meta: {
				description: 'It is what it is',
			},
		},
	});
};
