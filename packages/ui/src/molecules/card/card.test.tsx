import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card Components", () => {
	it("renders Card component", () => {
		render(<Card data-testid="card">Card content</Card>);
		expect(screen.getByTestId("card")).toBeInTheDocument();
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("renders Card with custom className", () => {
		render(
			<Card className="custom-class" data-testid="card">
				Card content
			</Card>,
		);
		const card = screen.getByTestId("card");
		expect(card).toHaveClass("custom-class");
	});

	it("renders CardHeader component", () => {
		render(<CardHeader data-testid="card-header">Header content</CardHeader>);
		expect(screen.getByTestId("card-header")).toBeInTheDocument();
		expect(screen.getByText("Header content")).toBeInTheDocument();
	});

	it("renders CardHeader with custom className", () => {
		render(
			<CardHeader className="custom-header" data-testid="card-header">
				Header content
			</CardHeader>,
		);
		const header = screen.getByTestId("card-header");
		expect(header).toHaveClass("custom-header");
	});

	it("renders CardTitle component", () => {
		render(<CardTitle data-testid="card-title">Card Title</CardTitle>);
		expect(screen.getByTestId("card-title")).toBeInTheDocument();
		expect(screen.getByText("Card Title")).toBeInTheDocument();
	});

	it("renders CardTitle with custom className", () => {
		render(
			<CardTitle className="custom-title" data-testid="card-title">
				Card Title
			</CardTitle>,
		);
		const title = screen.getByTestId("card-title");
		expect(title).toHaveClass("custom-title");
	});

	it("renders CardDescription component", () => {
		render(<CardDescription data-testid="card-description">Card description</CardDescription>);
		expect(screen.getByTestId("card-description")).toBeInTheDocument();
		expect(screen.getByText("Card description")).toBeInTheDocument();
	});

	it("renders CardDescription with custom className", () => {
		render(
			<CardDescription className="custom-description" data-testid="card-description">
				Card description
			</CardDescription>,
		);
		const description = screen.getByTestId("card-description");
		expect(description).toHaveClass("custom-description");
	});

	it("renders CardContent component", () => {
		render(<CardContent data-testid="card-content">Card content</CardContent>);
		expect(screen.getByTestId("card-content")).toBeInTheDocument();
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("renders CardContent with custom className", () => {
		render(
			<CardContent className="custom-content" data-testid="card-content">
				Card content
			</CardContent>,
		);
		const content = screen.getByTestId("card-content");
		expect(content).toHaveClass("custom-content");
	});

	it("renders CardFooter component", () => {
		render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);
		expect(screen.getByTestId("card-footer")).toBeInTheDocument();
		expect(screen.getByText("Footer content")).toBeInTheDocument();
	});

	it("renders CardFooter with custom className", () => {
		render(
			<CardFooter className="custom-footer" data-testid="card-footer">
				Footer content
			</CardFooter>,
		);
		const footer = screen.getByTestId("card-footer");
		expect(footer).toHaveClass("custom-footer");
	});

	it("renders complete Card with all subcomponents", () => {
		render(
			<Card data-testid="complete-card">
				<CardHeader>
					<CardTitle>Complete Card</CardTitle>
					<CardDescription>This is a complete card example</CardDescription>
				</CardHeader>
				<CardContent>
					<p>This is the main content of the card.</p>
				</CardContent>
				<CardFooter>
					<button type="button">Action</button>
				</CardFooter>
			</Card>,
		);

		expect(screen.getByTestId("complete-card")).toBeInTheDocument();
		expect(screen.getByText("Complete Card")).toBeInTheDocument();
		expect(screen.getByText("This is a complete card example")).toBeInTheDocument();
		expect(screen.getByText("This is the main content of the card.")).toBeInTheDocument();
		expect(screen.getByText("Action")).toBeInTheDocument();
	});

	it("forwards refs correctly", () => {
		const ref = { current: null };
		render(
			<Card ref={ref} data-testid="card-with-ref">
				Card with ref
			</Card>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("forwards additional props", () => {
		render(
			<Card data-testid="card-with-props" aria-label="Card label">
				Card with props
			</Card>,
		);
		const card = screen.getByTestId("card-with-props");
		expect(card).toHaveAttribute("aria-label", "Card label");
	});
});
