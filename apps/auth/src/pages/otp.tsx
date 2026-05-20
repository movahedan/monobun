type OtpPageProps = Readonly<{
	csrfToken: string;
	error?: string;
	info?: string;
	email?: string;
	step: "request" | "verify";
}>;

export function OtpPage(props: OtpPageProps) {
	const action = props.step === "request" ? "/otp" : "/otp/verify";
	const title = props.step === "request" ? "Email code" : "Enter code";

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{title} — Monobun Auth</title>
				<style>{`
          body { font-family: system-ui, sans-serif; max-width: 24rem; margin: 4rem auto; padding: 0 1rem; }
          label { display: block; margin-top: 1rem; }
          input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; box-sizing: border-box; }
          button { margin-top: 1.5rem; width: 100%; padding: 0.6rem; }
          .error { color: #b91c1c; margin-top: 1rem; }
          .info { color: #166534; margin-top: 1rem; }
          .links { margin-top: 1.5rem; font-size: 0.9rem; }
          .links a { margin-right: 1rem; }
        `}</style>
			</head>
			<body>
				<h1>{title}</h1>
				{props.error ? <p className="error">{props.error}</p> : null}
				{props.info ? <p className="info">{props.info}</p> : null}
				<form method="post" action={action}>
					<input type="hidden" name="csrf" value={props.csrfToken} />
					<label>
						Email
						<br />
						<input
							name="email"
							type="email"
							required
							readOnly={props.step === "verify"}
							defaultValue={props.email ?? ""}
						/>
					</label>
					{props.step === "verify" ? (
						<label>
							6-digit code
							<br />
							<input
								name="code"
								type="text"
								inputMode="numeric"
								pattern="[0-9]{6}"
								required
								maxLength={6}
							/>
						</label>
					) : null}
					<button type="submit">{props.step === "request" ? "Send code" : "Verify"}</button>
				</form>
				<p className="links">
					<a href="/login">Password sign in</a>
					<a href="/register">Register</a>
				</p>
			</body>
		</html>
	);
}
