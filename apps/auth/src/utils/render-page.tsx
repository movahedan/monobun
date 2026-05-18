import { renderToStaticMarkup } from "react-dom/server";

export function renderPage(element: React.ReactElement): string {
	return `<!DOCTYPE html>${renderToStaticMarkup(element)}`;
}
