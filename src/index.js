// step 1: The createElement Function
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === 'object' ? child : createTextElement(child)
			)
		}
	};
}

function createTextElement(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: []
		}
	};
}

// step 2: The render Function
function render(element, container) {
	// TODO create dom nodes
	// create the DOM node using the element type
	const dom =
		element.type === 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(element.type);

	// assign the element props to the node
	const isProperty = key => key !== 'children';
	Object.keys(element.props)
		.filter(isProperty)
		.forEach(name => {
			dom[name] = element.props[name];
		});

	element.props.children.forEach(child => render(child, dom));

	container.appendChild(dom);
}

const Didact = {
	createElement,
	render
};

/** @jsx Didact.createElement */
const element = (
	<div id="foo">
		<a>bar</a>
		<b />
	</div>
);
/* const element = Didact.createElement(
	'div',
	{ id: 'foo' },
	Didact.createElement('a', null, 'bar'),
	Didact.createElement('b')
); */
const container = document.getElementById('root');
Didact.render(element, container);
