// ###### REF ######: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/

const fetch = require('node-fetch');
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const slugify = require('slugify');

// {import} does not support importing JSON files, so we're using {require} instead. Same for those statements above to maintain consistency.
const authors = require('./src/data/authors.json');
const books = require('./src/data/books.json');

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
	// The object {actions} -- https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode
	// contains the functions and these can be individually extracted by using ES6 object destructuring.
	const { createNode, createTypes } = actions;

	// A Schema to create a relationship between the nodes
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
	// 	   means that the object {type Author} now have ALL FIELDS from the actual {authors} object (which has {slug, name, and every other fields from createNode below})
	// 	   AND an additional field called {books} which acts as a foreign key to the {type Book} (which means THIS {books} field now has EVERY fields that the {type Book} has).

	//     type Book implements Node {
	//         author: Author! @link(from: "author", by: "slug")
	//	       {from: "author"} is the {author} field from THIS {type Book} (created by the "implements Node")
	//	       {by: "slug"} is the {slug} field from the {type Author}, created by its "implements Node"
	//     }
	//	   means that the object {type Book} now have ALL FIELDS from the actual {books} object (which has {isbn, name, and every other fields from createNode below})
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

	// Putting the data (as Nodes) into the Gatsby GraphQL's data layer
	authors.forEach((author) => {
		// use forEach because we need to mutate the original object (authors)
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

exports.createPages = async ({ actions, graphql }) => {
	const { createPage } = actions;
	createPage({
		path: '/custom', // The URL's endpoint for this page
		component: require.resolve('./src/templates/custom.js'),
		context: {
			// this is why it makes sense to use Gatsby's Node API instead of create your own page
			title: 'A Random Page',
			meta: {
				description: 'It is what it is',
			},
		},
	});
	// When we created our author pages ({Author.slug}.js), you may remember that the books had different slugs
	// depending on whether they were part of a series or not.
	// For that reason, we can't use the file-based routing to create pages in this case.
	// Instead, using the createPages API and some custom logic to create the book pages in the right place.

	const result = await graphql(`
		query GetBooks {
			allBook {
				nodes {
					id
					series
					name
				}
			}
		}
	`);

	const books = result.data.allBook.nodes;

	books.forEach((book) => {
		const bookSlug = slugify(book.name, { lower: true });

		// These {createPage} creates the URL for a SINGULAR book, just like how the {Author.slug}.js filename is generated.
		if (book.series === null) {
			createPage({
				path: `/book/${bookSlug}`,
				component: require.resolve('./src/templates/book.js'),
				context: {
					id: book.id,
				},
			});
		} else {
			const seriesSlug = slugify(book.series, { lower: true });

			createPage({
				path: `/book/${seriesSlug}/${bookSlug}`,
				component: require.resolve('./src/templates/book.js'),
				context: {
					id: book.id,
				},
			});
		}
	});
};

exports.createResolvers = ({
	store,
	actions,
	cache,
	reporter,
	createNodeId,
	createResolvers,
}) => {
	const { createNode } = actions;

	// to add new fields to types, but not overriding the field type
	const resolvers = {
		// the {type Book}
		Book: {
			// a new field
			buyLink: {
				type: 'String',
				resolve: (
					// {resolve} is a reserved keyword for the "resolver" fuction, so we have to use it as-is. Renaming it wouldn't work
					source, // its param could be named as you like, but if there's only ONE, then it'll be its Type's object (in this case: Book)
				) =>
					`https://www.powells.com/searchresults?keyword=${source.isbn}`, // the link HAS TO BE in template string to be able to use the {source.isbn}
			},

			// another new field
			cover: {
				type: 'File',
				resolve: async (source) => {
					const response = await fetch(
						`https://openlibrary.org/isbn/${source.isbn}.json`,
					);
					if (!response.ok) {
						reporter.warn(
							`${source.name} is unavailable with status: ${response.status} - ${response.statusText}`,
						);
						return null;
					}

					const { covers } = await response.json();

					// When building source plugins for remote data sources such as headless CMSs, their data will often link to files stored remotely
					// that are often convenient to download so you can work with them locally.
					// The createRemoteFileNode helper makes it easy to download remote files and add them to your site’s GraphQL schema
					if (covers.length) {
						return createRemoteFileNode({
							url: `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`,
							store,
							cache,
							createNode,
							createNodeId,
							reporter,
						});
					}
					return null;
				},
			},
		},
	};
	createResolvers(resolvers);
};
