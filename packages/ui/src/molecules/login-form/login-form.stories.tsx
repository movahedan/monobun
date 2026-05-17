import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "./login-form";

const meta: Meta<typeof LoginForm> = {
	title: "Components/LoginForm",
	component: LoginForm,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A login form component with email and password fields.",
			},
		},
	},
	argTypes: {
		onSubmit: {
			action: "submitted",
			description: "Callback function when form is submitted",
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onSubmit: (data) => console.log("Form submitted:", data),
	},
};

export const Loading: Story = {
	render: () => (
		<LoginForm
			onSubmit={async (data) => {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				console.log("Form submitted:", data);
			}}
		/>
	),
};

export const WithError: Story = {
	render: () => (
		<LoginForm
			onSubmit={(_data) => {
				throw new Error("Invalid credentials");
			}}
		/>
	),
};
