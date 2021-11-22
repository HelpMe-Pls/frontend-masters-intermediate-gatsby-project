import * as React from 'react';

const CustomPage = ({ pageContext }) => {
	// {pageContext} is the {context} field from the {createPage} function in gatsby-node.js file
	return (
		<div>
			<h1>{pageContext.title}</h1>
			<pre>{JSON.stringify(pageContext, null, 4)}</pre>
		</div>
	);
};

export default CustomPage;
