import { cn } from "@repo/utils/cn";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { Button } from "../button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import { Input } from "../input/input";
import { Label } from "../label/label";

export interface LoginFormData {
	email: string;
	password: string;
}

export interface LoginFormProps {
	/** Callback function called when the form is submitted */
	onSubmit: (data: LoginFormData) => Promise<void> | void;
	/** Whether the form is in a loading state */
	loading?: boolean;
	/** Error message to display */
	error?: string;
	/** Success message to display */
	success?: string;
	/** Additional CSS classes */
	className?: string;
	/** Whether to show the password toggle */
	showPasswordToggle?: boolean;
	/** Custom submit button text */
	submitText?: string;
	/** Custom title text */
	title?: string;
	/** Custom description text */
	description?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
	onSubmit,
	loading = false,
	error,
	success,
	className,
	showPasswordToggle = true,
	submitText = "Sign In",
	title = "Welcome back",
	description = "Enter your credentials to access your account",
}) => {
	const emailId = useId();
	const passwordId = useId();
	const emailErrorId = useId();
	const passwordErrorId = useId();

	const [formData, setFormData] = React.useState<LoginFormData>({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = React.useState(false);
	const [validationErrors, setValidationErrors] = React.useState<Partial<LoginFormData>>({});

	const handleInputChange =
		(field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setFormData((prev) => ({ ...prev, [field]: value }));

			// Only clear validation error if the new value is valid
			if (validationErrors[field]) {
				let isValid = true;

				if (field === "email") {
					isValid = value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
				} else if (field === "password") {
					isValid = value === "" || value.length >= 6;
				}

				if (isValid) {
					setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
				}
			}
		};

	const validateForm = (): boolean => {
		const errors: Partial<LoginFormData> = {};

		if (!formData.email) {
			errors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			errors.password = "Password is required";
		} else if (formData.password.length < 6) {
			errors.password = "Password must be at least 6 characters";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await onSubmit(formData);
		} catch (err) {
			// Error handling is done by the parent component
			console.error("Login form submission error:", err);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<Card className={cn("w-full max-w-md mx-auto", className)}>
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl text-center">{title}</CardTitle>
				<CardDescription className="text-center">{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Email Field */}
					<div className="space-y-2">
						<Label htmlFor={emailId}>Email</Label>
						<Input
							id={emailId}
							type="email"
							placeholder="Enter your email"
							value={formData.email}
							onChange={handleInputChange("email")}
							disabled={loading}
							aria-describedby={validationErrors.email ? emailErrorId : undefined}
							aria-invalid={!!validationErrors.email}
						/>
						{validationErrors.email && (
							<p id={emailErrorId} className="text-sm text-destructive">
								{validationErrors.email}
							</p>
						)}
					</div>

					{/* Password Field */}
					<div className="space-y-2">
						<Label htmlFor={passwordId}>Password</Label>
						<div className="relative">
							<Input
								id={passwordId}
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								value={formData.password}
								onChange={handleInputChange("password")}
								disabled={loading}
								aria-describedby={validationErrors.password ? passwordErrorId : undefined}
								aria-invalid={!!validationErrors.password}
							/>
							{showPasswordToggle && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={togglePasswordVisibility}
									disabled={loading}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							)}
						</div>
						{validationErrors.password && (
							<p id={passwordErrorId} className="text-sm text-destructive">
								{validationErrors.password}
							</p>
						)}
					</div>

					{/* Error Message */}
					{error && (
						<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
							{error}
						</div>
					)}

					{/* Success Message */}
					{success && (
						<div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
							{success}
						</div>
					)}

					{/* Submit Button */}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{submitText}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
