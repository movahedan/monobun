import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./link";

const meta: Meta<typeof Link> = {
	title: "Components/Link",
	component: Link,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A link component for navigation and external links.",
			},
		},
	},
	argTypes: {
		href: {
			control: { type: "text" },
			description: "The URL the link points to",
		},
		children: {
			control: { type: "text" },
			description: "The link text",
		},
		newTab: {
			control: { type: "boolean" },
			description: "Whether the link opens in a new tab",
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		href: "#",
		children: "Link",
	},
};

export const External: Story = {
	args: {
		href: "https://example.com",
		children: "External Link",
		newTab: true,
	},
};

export const Internal: Story = {
	args: {
		href: "/about",
		children: "About Us",
	},
};

export const WithIcon: Story = {
	render: () => (
		<Link href="https://github.com" newTab>
			GitHub ↗
		</Link>
	),
};
