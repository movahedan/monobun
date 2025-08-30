import type { Meta, StoryObj } from "@storybook/react";
import { useId } from "react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
	title: "Components/Input",
	component: Input,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A flexible input component with various types and states.",
			},
		},
	},
	argTypes: {
		type: {
			control: { type: "select" },
			options: ["text", "email", "password", "number", "tel", "url", "search"],
			description: "The type of input",
		},
		placeholder: {
			control: { type: "text" },
			description: "Placeholder text",
		},
		disabled: {
			control: { type: "boolean" },
			description: "Whether the input is disabled",
		},
		className: {
			control: { type: "text" },
			description: "Additional CSS classes",
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

export const Email: Story = {
	args: {
		type: "email",
		placeholder: "Enter your email",
	},
};

export const Password: Story = {
	args: {
		type: "password",
		placeholder: "Enter your password",
	},
};

export const NumberInput: Story = {
	args: {
		type: "number",
		placeholder: "Enter a number",
	},
};

export const Search: Story = {
	args: {
		type: "search",
		placeholder: "Search...",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		placeholder: "Disabled input",
	},
};

const WithLabelComponent = () => {
	const emailId = useId();

	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<label htmlFor={emailId}>Email</label>
			<Input id={emailId} type="email" placeholder="Enter your email" />
		</div>
	);
};

export const WithLabel: Story = {
	render: () => <WithLabelComponent />,
};

const WithErrorComponent = () => {
	const emailId = useId();

	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<label htmlFor={emailId}>Email</label>
			<Input
				id={emailId}
				type="email"
				placeholder="Enter your email"
				className="border-red-500 focus:border-red-500"
			/>
			<p className="text-sm text-red-500">Please enter a valid email address.</p>
		</div>
	);
};

export const WithError: Story = {
	render: () => <WithErrorComponent />,
};
