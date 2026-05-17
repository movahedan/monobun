import { describe, expect, it } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { CounterButton } from "./counter-button";

describe("CounterButton", () => {
	it("renders without crashing", () => {
		render(<CounterButton />);
		expect(screen.getByText("This component is from")).toBeInTheDocument();
	});

	it("displays initial count of 0", () => {
		render(<CounterButton />);
		expect(screen.getByText("Count: 0")).toBeInTheDocument();
	});

	it("increments count when button is clicked", () => {
		render(<CounterButton />);

		const button = screen.getByText("Count: 0");
		expect(button).toBeInTheDocument();

		fireEvent.click(button);
		expect(screen.getByText("Count: 1")).toBeInTheDocument();
	});

	it("increments count multiple times when button is clicked repeatedly", () => {
		render(<CounterButton />);

		const button = screen.getByText("Count: 0");

		// Click multiple times
		fireEvent.click(button);
		expect(screen.getByText("Count: 1")).toBeInTheDocument();

		fireEvent.click(button);
		expect(screen.getByText("Count: 2")).toBeInTheDocument();

		fireEvent.click(button);
		expect(screen.getByText("Count: 3")).toBeInTheDocument();
	});

	it("displays the correct UI elements", () => {
		render(<CounterButton />);

		// Check for the main description text
		expect(screen.getByText("This component is from")).toBeInTheDocument();

		// Check for the code element
		expect(screen.getByText("ui")).toBeInTheDocument();

		// Check for the button
		expect(screen.getByRole("button")).toBeInTheDocument();
		expect(screen.getByText("Count: 0")).toBeInTheDocument();
	});

	it("button has correct type attribute", () => {
		render(<CounterButton />);

		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "button");
	});
});
