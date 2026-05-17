import type { Meta, StoryObj } from "@storybook/react";
import { CounterButton } from "./counter-button";

const meta: Meta<typeof CounterButton> = {
	title: "Components/CounterButton",
	component: CounterButton,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "An interactive button component that maintains a counter state.",
			},
		},
	},
	argTypes: {
		initialCount: {
			control: { type: "number" },
			description: "The initial count value",
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		initialCount: 0,
	},
};

export const WithInitialCount: Story = {
	args: {
		initialCount: 5,
	},
};

export const NegativeStart: Story = {
	args: {
		initialCount: -3,
	},
};
