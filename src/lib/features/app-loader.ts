import invariant from 'tiny-invariant';

function getLoader() {
	const loader = document.getElementById('app-loader');
	invariant(loader, '#app-loader element should be present in the DOM');

	return loader;
}

export function showAppLoader() {
	const loader = getLoader();

	loader.dataset.state = 'visible';
}

export function hideAppLoader() {
	const loader = getLoader();

	loader.dataset.state = 'hidden';
}
