export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isToday(dateStr: string) {
	const d = new Date(dateStr);
	const now = new Date();
	return (
		d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth() &&
		d.getDate() === now.getDate()
	);
}
