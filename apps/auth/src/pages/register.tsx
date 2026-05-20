type RegisterPageProps = Readonly<{
	csrfToken: string;
	error?: string;
	email?: string;
	tenantName?: string;
}>;

export function RegisterPage(props: RegisterPageProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Create account — Monobun Auth</title>
				<style>{`
          body { font-family: system-ui, sans-serif; max-width: 24rem; margin: 4rem auto; padding: 0 1rem; }
          label { display: block; margin-top: 1rem; }
          input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; box-sizing: border-box; }
          button { margin-top: 1.5rem; width: 100%; padding: 0.6rem; }
          .error { color: #b91c1c; margin-top: 1rem; }
          .links { margin-top: 1.5rem; font-size: 0.9rem; }
          .links a { margin-right: 1rem; }
        `}</style>
			</head>
			<body>
				<h1>Create account</h1>
				{props.error ? <p className="error">{props.error}</p> : null}
				<form method="post" action="/register">
					<input type="hidden" name="csrf" value={props.csrfToken} />
					<label>
						Email
						<br />
						<input name="email" type="email" required defaultValue={props.email ?? ""} />
					</label>
					<label>
						Password
						<br />
						<input name="password" type="password" required minLength={8} />
					</label>
					<label>
						Workspace name (optional)
						<br />
						<input
							name="tenantName"
							type="text"
							maxLength={80}
							defaultValue={props.tenantName ?? ""}
						/>
					</label>
					<button type="submit">Register</button>
				</form>
				<p className="links">
					<a href="/login">Sign in</a>
					<a href="/otp">Sign in with code</a>
				</p>
			</body>
		</html>
	);
}
