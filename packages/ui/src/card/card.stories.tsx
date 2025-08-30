import type { Meta, StoryObj } from "@storybook/react";
import { useId } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = {
	title: "Components/Card",
	component: Card,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "A flexible card component for displaying content in a structured layout.",
			},
		},
	},
	argTypes: {
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
	render: () => (
		<Card>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<p>This is the main content of the card.</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	),
};

export const ContentOnly: Story = {
	render: () => (
		<Card>
			<CardContent>
				<p>This card only has content, no header or footer.</p>
			</CardContent>
		</Card>
	),
};

export const HeaderOnly: Story = {
	render: () => (
		<Card>
			<CardHeader>
				<CardTitle>Header Only</CardTitle>
				<CardDescription>This card only has a header section.</CardDescription>
			</CardHeader>
		</Card>
	),
};

export const FooterOnly: Story = {
	render: () => (
		<Card>
			<CardContent>
				<p>Content with footer</p>
			</CardContent>
			<CardFooter>
				<p>Footer content</p>
			</CardFooter>
		</Card>
	),
};

const ComplexLayoutComponent = () => {
	const nameId = useId();
	const frameworkId = useId();

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Create project</CardTitle>
				<CardDescription>Deploy your new project in one-click.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid w-full items-center gap-4">
					<div className="flex flex-col space-y-1.5">
						<label htmlFor={nameId}>Name</label>
						<input
							id={nameId}
							placeholder="Name of your project"
							className="border rounded px-3 py-2"
						/>
					</div>
					<div className="flex flex-col space-y-1.5">
						<label htmlFor={frameworkId}>Framework</label>
						<select id={frameworkId} className="border rounded px-3 py-2">
							<option value="">Select a framework</option>
							<option value="next">Next.js</option>
							<option value="sveltekit">SvelteKit</option>
							<option value="astro">Astro</option>
							<option value="nuxt">Nuxt.js</option>
						</select>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				<button type="button" className="px-4 py-2 border rounded">
					Cancel
				</button>
				<button type="button" className="px-4 py-2 bg-blue-500 text-white rounded">
					Deploy
				</button>
			</CardFooter>
		</Card>
	);
};

export const ComplexLayout: Story = {
	render: () => <ComplexLayoutComponent />,
};
