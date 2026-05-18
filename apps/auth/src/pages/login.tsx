export function LoginPage(props: { csrfToken: string; error?: string; email?: string }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Sign in — Monobun Auth</title>
				<style>{`
          body { font-family: system-ui, sans-serif; max-width: 24rem; margin: 4rem auto; padding: 0 1rem; }
          label { display: block; margin-top: 1rem; }
          input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; box-sizing: border-box; }
          button { margin-top: 1.5rem; width: 100%; padding: 0.6rem; }
          .error { color: #b91c1c; margin-top: 1rem; }
        `}</style>
			</head>
			<body>
				<h1>Sign in</h1>
				{props.error ? <p className="error">{props.error}</p> : null}
				<form method="post" action="/login">
					<input type="hidden" name="csrf" value={props.csrfToken} />
					<label>
						Email
						<input name="email" type="email" required defaultValue={props.email ?? ""} />
					</label>
					<label>
						Password
						<input name="password" type="password" required minLength={8} />
					</label>
					<button type="submit">Sign in</button>
				</form>
			</body>
		</html>
	);
}
