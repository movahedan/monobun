import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
	it("renders without crashing", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
	});

	it("renders with default props", () => {
		render(<Button>Default Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Default Button");
		expect(button).toHaveAttribute("data-slot", "button");
	});

	it("handles click events", () => {
		const handleClick = mock();
		render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
	});

	it("renders different variants", () => {
		const { rerender } = render(<Button variant="default">Default</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button variant="destructive">Destructive</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button variant="outline">Outline</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button variant="secondary">Secondary</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button variant="ghost">Ghost</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button variant="link">Link</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("renders different sizes", () => {
		const { rerender } = render(<Button size="default">Default</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button size="sm">Small</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button size="lg">Large</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
		rerender(<Button size="icon">Icon</Button>);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(<Button className="custom-class">Custom Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("custom-class");
	});

	it("renders as child component when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>,
		);
		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/test");
		expect(link).toHaveAttribute("data-slot", "button");
	});

	it("forwards additional props", () => {
		render(
			<Button data-testid="test-button" aria-label="Test button">
				Test
			</Button>,
		);
		const button = screen.getByTestId("test-button");
		expect(button).toHaveAttribute("aria-label", "Test button");
	});

	it("renders with type attribute", () => {
		render(<Button type="submit">Submit</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "submit");
	});
});
