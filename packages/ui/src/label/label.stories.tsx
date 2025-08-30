import type { Meta, StoryObj } from "@storybook/react";
import { useId } from "react";
import { Input } from "../input/input";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
	title: "Components/Label",
	component: Label,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A label component for form inputs and other elements.",
			},
		},
	},
	argTypes: {
		children: {
			control: { type: "text" },
			description: "The label text",
		},
		htmlFor: {
			control: { type: "text" },
			description: "The ID of the element this label is for",
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Label",
	},
};

const WithInputComponent = () => {
	const emailId = useId();

	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor={emailId}>Email</Label>
			<Input id={emailId} type="email" placeholder="Enter your email" />
		</div>
	);
};

export const WithInput: Story = {
	render: () => <WithInputComponent />,
};

const WithCheckboxComponent = () => {
	const termsId = useId();

	return (
		<div className="flex items-center space-x-2">
			<input type="checkbox" id={termsId} />
			<Label htmlFor={termsId}>I agree to the terms and conditions</Label>
		</div>
	);
};

export const WithCheckbox: Story = {
	render: () => <WithCheckboxComponent />,
};

const WithRadioComponent = () => {
	const option1Id = useId();
	const option2Id = useId();
	const option3Id = useId();

	return (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<input type="radio" id={option1Id} name="options" />
				<Label htmlFor={option1Id}>Option 1</Label>
			</div>
			<div className="flex items-center space-x-2">
				<input type="radio" id={option2Id} name="options" />
				<Label htmlFor={option2Id}>Option 2</Label>
			</div>
			<div className="flex items-center space-x-2">
				<input type="radio" id={option3Id} name="options" />
				<Label htmlFor={option3Id}>Option 3</Label>
			</div>
		</div>
	);
};

export const WithRadio: Story = {
	render: () => <WithRadioComponent />,
};
