// ###### REF ######: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/

const authors = require('./src/data/authors.json');
const books = require('./src/data/books.json');

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
	// The object {actions} -- https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode
	// contains the functions and these can be individually extracted by using ES6 object destructuring.
	const { createNode, createTypes } = actions;

	// A GraphQL Schema
	createTypes(`   
        type Author implements Node {
            books: [Book!]! @link(from: "slug", by: "author.slug")
        }

        type Book implements Node {
            author: Author! @link(from: "author", by: "slug")
        }
    `);
	//	###### Explaining the above Schema ######
	// createTypes(`
	//     type Author implements Node {
	//         books: [Book!]! @link(from: "slug", by: "author.slug")
	//	  	   [Book!]! is the {type Book}, used as an array.
	//	  	   @link(from: "slug", by: "author.slug") is the foreign key points to the Book node
	//		   {from: "slug"} is the {slug} field from THIS {type Author} (created by the "implements Node")
	//		   {by: "author.slug"} is the {author.slug} field from the {type Book}, created by its foreign key
	//     }
	// 	   means that the {type Author} now have ALL FIELDS from the actual {authors} object (which has {slug, name, and every other fields from createNode below})
	// 	   AND an additional field called {books} which acts as a foreign key to the {type Book} (which means THIS {books} field now has EVERY fields that the {type Book} has).

	//     type Book implements Node {
	//         author: Author! @link(from: "author", by: "slug")
	//	       {from: "author"} is the {author} field from THIS {type Book} (created by the "implements Node")
	//	       {by: "slug"} is the {slug} field from the {type Author}, created by its "implements Node"
	//     }
	//	   means that the {type Book} now have ALL FIELDS from the actual {books} object (which has {isbn, name, and every other fields from createNode below})
	// 	   AND its {author} field is now has the form of the actual {authors} object
	//	   and it also acts as a foreign key to the {type Author} (which means THIS {author} field now has EVERY fields that the {type Author} has).
	// `);
	//
	//
	//###### A Sample Query to display the use of those Types above ######
	//	query MyQuery {
	//		allAuthor {
	//	  		nodes {
	//				id
	//				name
	//				books {
	//		  			name
	//		  			isbn
	//		    	}
	//	  	   }
	//		}
	//		allBook {
	//	  		nodes {
	//				isbn
	//				name
	//				seriesOrder
	//				series
	//				id
	//				author {
	//		  			name
	//		  			books {
	//						name
	//		  			}
	//				}
	//	  		}
	//		}
	//	}
	// allAuthor: For each author, get all of their books.
	// allBooks: For each book, get all of its info and then all of the other books from the same author.

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
	books.forEach((book) => {
		createNode({
			...book,
			id: createNodeId(`book-${book.isbn}`),
			parent: null,
			children: [],
			internal: {
				type: 'Book',
				content: JSON.stringify(book),
				contentDigest: createContentDigest(book),
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
