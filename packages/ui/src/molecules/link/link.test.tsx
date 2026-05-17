import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Link } from "./link";

describe("Link", () => {
	it("renders without crashing", () => {
		render(<Link href="https://turborepo.com">Turborepo Docs</Link>);
		expect(screen.getByRole("link", { name: "Turborepo Docs" })).toBeInTheDocument();
	});

	it("renders with required href and children", () => {
		render(<Link href="https://example.com">Example Link</Link>);

		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "https://example.com");
		expect(link).toHaveTextContent("Example Link");
	});

	it("opens in new tab when newTab is true", () => {
		render(
			<Link href="https://example.com" newTab>
				External Link
			</Link>,
		);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noreferrer");
	});

	it("does not open in new tab when newTab is false", () => {
		render(
			<Link href="https://example.com" newTab={false}>
				Internal Link
			</Link>,
		);

		const link = screen.getByRole("link");
		expect(link).not.toHaveAttribute("target");
		expect(link).not.toHaveAttribute("rel");
	});

	it("does not open in new tab by default", () => {
		render(<Link href="https://example.com">Default Link</Link>);

		const link = screen.getByRole("link");
		expect(link).not.toHaveAttribute("target");
		expect(link).not.toHaveAttribute("rel");
	});

	it("forwards additional props", () => {
		render(
			<Link
				href="https://example.com"
				data-testid="test-link"
				aria-label="Test link"
				className="custom-class"
			>
				Test Link
			</Link>,
		);

		const link = screen.getByTestId("test-link");
		expect(link).toHaveAttribute("aria-label", "Test link");
		expect(link).toHaveClass("custom-class");
		expect(link).toHaveAttribute("href", "https://example.com");
	});

	it("renders with different href types", () => {
		const { rerender } = render(<Link href="/relative">Relative</Link>);
		expect(screen.getByRole("link")).toHaveAttribute("href", "/relative");

		rerender(<Link href="mailto:test@example.com">Email</Link>);
		expect(screen.getByRole("link")).toHaveAttribute("href", "mailto:test@example.com");

		rerender(<Link href="tel:+1234567890">Phone</Link>);
		expect(screen.getByRole("link")).toHaveAttribute("href", "tel:+1234567890");
	});

	it("renders with complex children", () => {
		render(
			<Link href="https://example.com">
				<span>Icon</span> Text with <strong>bold</strong> content
			</Link>,
		);

		const link = screen.getByRole("link");
		expect(link).toHaveTextContent("Icon Text with bold content");
		expect(link.querySelector("span")).toBeInTheDocument();
		expect(link.querySelector("strong")).toBeInTheDocument();
	});

	it("handles empty children", () => {
		render(<Link href="https://example.com"> </Link>);

		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "https://example.com");
	});
});
