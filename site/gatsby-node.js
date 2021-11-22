// ###### REF ######: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/

const authors = require('./src/data/authors.json');
const books = require('./src/data/books.json');

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
	// The object {actions} -- https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode
	// contains the functions and these can be individually extracted by using ES6 object destructuring.
	const { createNode } = actions;
	authors.forEach((author) => {
		createNode({
			// other than required default fields you can add extra custom fields of your own
			// according to Gatsby docs, it only takes JUST ONE OBJECT as an argument
			...author, // therefore, we have to spread the author object to get all of its field (in this case: slug & name) into the node
			id: createNodeId(`author-${author.slug}`),
			parent: null,
			children: [],
			internal: {
				type: 'Author',
				content: JSON.stringify(author), //optional
				contentDigest: createContentDigest(author), // kinda like a cache for node
			},
		});
	});
};

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
