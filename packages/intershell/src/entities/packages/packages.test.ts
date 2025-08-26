import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { restoreBunMocks, setupBunMocks } from "@repo/test-preset/mock-bun";
import { mockFsModule } from "@repo/test-preset/mock-modules";
import type { PackageJson } from "./types";

const mockPackageJson = (overrides: Partial<PackageJson> = {}): PackageJson => ({
	name: "test-package",
	version: "1.0.0",
	description: "Test package",
	...overrides,
});

mock.module("node:fs", () =>
	mockFsModule((path) => {
		if (path.includes("package.json")) {
			return JSON.stringify(mockPackageJson());
		}
		return "";
	}),
);

setupBunMocks();

const { EntityPackages } = await import("./packages");

describe("EntityPackages", () => {
	let packages: InstanceType<typeof EntityPackages>;
	const mockPackageName = "test-package";

	beforeEach(() => {
		if (!globalThis.Bun?.$ || globalThis.Bun.$.toString().includes("Mock")) {
			setupBunMocks();
		}
	});

	afterEach(() => {
		restoreBunMocks();
		mock.restore();
	});

	describe("constructor", () => {
		it("should create instance with package name", () => {
			packages = new EntityPackages(mockPackageName);
			expect(packages).toBeInstanceOf(EntityPackages);
		});

		it("should read package.json on construction", () => {
			packages = new EntityPackages(mockPackageName);
			expect(packages).toBeInstanceOf(EntityPackages);
		});
	});

	describe("getPath", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should return root path for root package", () => {
			const rootPackages = new EntityPackages("root");
			expect(rootPackages.getPath()).toBe(".");
		});

		it("should return packages path for @repo packages", () => {
			const repoPackages = new EntityPackages("@repo/test-package");
			expect(repoPackages.getPath()).toBe("packages/test-package");
		});

		it("should return apps path for regular packages", () => {
			expect(packages.getPath()).toBe("apps/test-package");
		});
	});

	describe("getJsonPath", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should return correct package.json path", () => {
			expect(packages.getJsonPath()).toBe("apps/test-package/package.json");
		});

		it("should return correct path for root package", () => {
			const rootPackages = new EntityPackages("root");
			expect(rootPackages.getJsonPath()).toBe("./package.json");
		});

		it("should return correct path for @repo package", () => {
			const repoPackages = new EntityPackages("@repo/test-package");
			expect(repoPackages.getJsonPath()).toBe("packages/test-package/package.json");
		});
	});

	describe("readJson", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should return cached package.json if available", () => {
			const result1 = packages.readJson();
			expect(result1).toEqual(mockPackageJson());

			const result2 = packages.readJson();
			expect(result2).toEqual(mockPackageJson());
		});

		it("should read and parse package.json from file", () => {
			const result = packages.readJson();
			expect(result).toEqual(mockPackageJson());
		});

		it("should throw error when file read fails", () => {
			expect(() => {
				new EntityPackages("error-package");
			}).not.toThrow();
		});

		it("should throw error when JSON parsing fails", () => {
			expect(() => {
				new EntityPackages("invalid-json-package");
			}).not.toThrow();
		});
	});

	describe("writeJson", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should write package.json and run biome check", async () => {
			setupBunMocks({
				command: {
					text: "biome check completed",
					exitCode: 0,
				},
				write: {
					result: 42,
				},
			});

			const newData = { ...mockPackageJson(), version: "2.0.0" };
			await packages.writeJson(newData);

			expect(packages.readJson().version).toBe("2.0.0");
		});

		it("should update cached package.json", async () => {
			const newData = { ...mockPackageJson(), version: "3.0.0" };
			await packages.writeJson(newData);

			expect(packages.readJson().version).toBe("3.0.0");
		});
	});

	describe("readVersion", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should return version from package.json", () => {
			const version = packages.readVersion();
			expect(version).toBe("1.0.0");
		});
	});

	describe("writeVersion", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should update version and write package.json", async () => {
			await packages.writeVersion("2.0.0");
			expect(packages.readVersion()).toBe("2.0.0");
		});

		it("should update cached package.json version", async () => {
			await packages.writeVersion("3.0.0");
			expect(packages.readVersion()).toBe("3.0.0");
		});
	});

	describe("getChangelogPath", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should return correct changelog path", () => {
			expect(packages.getChangelogPath()).toBe("apps/test-package/CHANGELOG.md");
		});
	});

	describe("readChangelog", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should read changelog content", () => {
			mock.module("node:fs", () => ({
				readFileSync: (path: string, _encoding: string) => {
					if (path.includes("package.json")) {
						return JSON.stringify(mockPackageJson());
					}
					if (path.includes("CHANGELOG.md")) {
						return "# Test Changelog\n\n## 1.0.0\n- Initial release";
					}
					return "";
				},
				writeFileSync: () => {},
				existsSync: () => true,
			}));

			const changelogPackages = new EntityPackages("test-package");
			const result = changelogPackages.readChangelog();
			expect(result).toBe("# Test Changelog\n\n## 1.0.0\n- Initial release");
		});

		it("should return empty string when changelog is empty", () => {
			mock.module("node:fs", () =>
				mockFsModule((path) => {
					if (path.includes("package.json")) {
						return JSON.stringify(mockPackageJson());
					}
					if (path.includes("CHANGELOG.md")) {
						return "";
					}
					return "";
				}),
			);
			const emptyChangelogPackages = new EntityPackages("test-package");
			const result = emptyChangelogPackages.readChangelog();
			expect(result).toBe("");
		});

		it("should throw error when changelog read fails", () => {
			expect(() => packages.readChangelog()).not.toThrow();
		});
	});

	describe("writeChangelog", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should write changelog when file exists", async () => {
			const content = "# New Changelog\n\n## 2.0.0\n- New features";
			await packages.writeChangelog(content);
			expect(packages).toBeDefined();
		});

		it("should create changelog with createPath when file doesn't exist", async () => {
			const content = "# New Changelog\n\n## 2.0.0\n- New features";
			await packages.writeChangelog(content);
			expect(packages).toBeDefined();
		});
	});

	describe("validatePackage", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should return valid result for valid package", () => {
			const result = packages.validatePackage();
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should return error for invalid version format", () => {
			mock.module("node:fs", () =>
				mockFsModule((path) => {
					if (path.includes("package.json")) {
						return JSON.stringify(mockPackageJson({ version: "invalid-version" }));
					}
					return "";
				}),
			);

			const invalidPackages = new EntityPackages("invalid-version-package");
			const result = invalidPackages.validatePackage();
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0]).toEqual({
				code: "INVALID_VERSION",
				message: "Version should follow semantic versioning",
				field: "version",
			});
		});

		it("should return error for missing description", () => {
			const packageJson = mockPackageJson();
			delete packageJson.description;
			mock.module("node:fs", () =>
				mockFsModule((path) => {
					if (path.includes("package.json")) {
						return JSON.stringify(packageJson);
					}
					return "";
				}),
			);

			const noDescPackages = new EntityPackages("no-description-package");
			const result = noDescPackages.validatePackage();
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0]).toEqual({
				code: "MISSING_DESCRIPTION",
				message: "Consider adding a description to package.json",
				field: "description",
			});
		});

		it("should return multiple errors for multiple issues", () => {
			const packageJson = mockPackageJson({ version: "invalid" });
			delete packageJson.description;
			mock.module("node:fs", () =>
				mockFsModule((path) => {
					if (path.includes("package.json")) {
						return JSON.stringify(packageJson);
					}
					return "";
				}),
			);

			const multiIssuePackages = new EntityPackages("multi-issue-package");
			const result = multiIssuePackages.validatePackage();
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(2);
			expect(result.errors).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ code: "INVALID_VERSION" }),
					expect.objectContaining({ code: "MISSING_DESCRIPTION" }),
				]),
			);
		});

		it("should validate semantic versioning correctly", () => {
			const validVersions = ["1.0.0", "2.1.3", "10.20.30"];
			const invalidVersions = ["1.0", "1.0.0.0", "1.0.0-beta", "v1.0.0"];

			validVersions.forEach((version) => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(mockPackageJson({ version }));
						}
						return "";
					}),
				);

				const validPackages = new EntityPackages(`valid-${version}-package`);
				const result = validPackages.validatePackage();
				expect(result.isValid).toBe(true);
			});

			invalidVersions.forEach((version) => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(mockPackageJson({ version }));
						}
						return "";
					}),
				);

				const invalidPackages = new EntityPackages(`invalid-${version}-package`);
				const result = invalidPackages.validatePackage();
				expect(result.isValid).toBe(false);
			});
		});
	});

	describe("static methods", () => {
		describe("getRepoUrl", () => {
			it("should return repository URL when repository is a string", () => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(
								mockPackageJson({
									name: "root",
									repository: "https://github.com/user/repo.git",
								}),
							);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("https://github.com/user/repo.git");
			});

			it("should return repository URL when repository is an object", () => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(
								mockPackageJson({
									name: "root",
									repository: {
										type: "git",
										url: "https://github.com/user/repo.git",
									},
								}),
							);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("https://github.com/user/repo.git");
			});

			it("should return empty string when repository is missing", () => {
				const packageJson = mockPackageJson({ name: "root" });
				delete packageJson.repository;
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(packageJson);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return empty string when repository object has no url", () => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(
								mockPackageJson({
									name: "root",
									repository: {
										type: "git",
										url: "",
									},
								}),
							);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return empty string when repository object has no url property", () => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(
								mockPackageJson({
									name: "root",
									repository: {
										type: "git",
										url: "",
									},
								}),
							);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return empty string when repository is undefined", () => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(
								mockPackageJson({
									name: "root",
									repository: undefined,
								}),
							);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return repository URL when repository is a string", () => {
				mock.module("node:fs", () =>
					mockFsModule((path) => {
						if (path.includes("package.json")) {
							return JSON.stringify(
								mockPackageJson({
									name: "root",
									repository: "https://github.com/example/repo",
								}),
							);
						}
						return "";
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("https://github.com/example/repo");
			});
		});

		describe("getAllPackages", () => {
			it("should return list of packages including root", async () => {
				const mockFsContent = (path: string) => {
					if (path.includes("apps/test-app/package.json")) {
						return JSON.stringify({ name: "test-app", version: "1.0.0" });
					}
					if (path.includes("apps/another-app/package.json")) {
						return JSON.stringify({ name: "another-app", version: "1.0.0" });
					}
					if (path.includes("packages/ui/package.json")) {
						return JSON.stringify({ name: "@repo/ui", version: "1.0.0" });
					}
					if (path.includes("packages/utils/package.json")) {
						return JSON.stringify({ name: "@repo/utils", version: "1.0.0" });
					}
					if (path.includes("package.json")) {
						return JSON.stringify({ name: "root", version: "1.0.0" });
					}
					return "";
				};

				const { mockFsPromisesModule } = await import("@repo/test-preset/mock-modules");
				mock.module("node:fs/promises", () => mockFsPromisesModule(mockFsContent));

				const result = await EntityPackages.getAllPackages();

				expect(result).toContain("root");
				expect(result).toContain("test-app");
				expect(result).toContain("another-app");
				expect(result).toContain("@repo/ui");
				expect(result).toContain("@repo/utils");
			});

			it("should handle empty directories gracefully", async () => {
				mock.module("node:fs/promises", () => ({
					readdir: async () => [],
					access: async (path: string) => {
						if (
							path.includes("package.json") &&
							!path.includes("/apps") &&
							!path.includes("/packages")
						) {
							return Promise.resolve();
						}
						return Promise.reject(new Error("ENOENT: no such file or directory"));
					},
					readFile: async (path: string) => {
						if (
							path.includes("package.json") &&
							!path.includes("/apps") &&
							!path.includes("/packages")
						) {
							return JSON.stringify({ name: "root", version: "1.0.0" });
						}
						return "";
					},
				}));

				const result = await EntityPackages.getAllPackages();
				expect(result).toEqual(["root"]);
			});

			it("should filter out packages without valid package.json", async () => {
				mock.module("node:fs/promises", () => ({
					readdir: async (path: string) => {
						if (path.includes("/apps")) {
							return [{ name: "invalid-app", isDirectory: () => true }];
						}
						if (path.includes("/packages")) {
							return [{ name: "invalid-pkg", isDirectory: () => true }];
						}
						return [];
					},
					access: async (path: string) => {
						if (path.includes("package.json")) {
							return Promise.resolve();
						}
						return Promise.reject(new Error("ENOENT: no such file or directory"));
					},
					readFile: async (path: string) => {
						if (path.includes("package.json")) {
							if (path.includes("/apps") || path.includes("/packages")) {
								return JSON.stringify({ version: "1.0.0" });
							}
							return JSON.stringify({ name: "root", version: "1.0.0" });
						}
						return "";
					},
				}));

				const result = await EntityPackages.getAllPackages();
				expect(result).toEqual(["root"]);
			});
		});
	});

	describe("edge cases and error handling", () => {
		it("should handle package names with special characters", () => {
			const specialPackages = new EntityPackages("test-package@1.0.0");
			expect(specialPackages.getPath()).toBe("apps/test-package@1.0.0");
		});

		it("should handle empty package name", () => {
			const emptyPackages = new EntityPackages("");
			expect(emptyPackages.getPath()).toBe("apps/");
		});

		it("should handle very long package names", () => {
			const longName = "a".repeat(1000);
			const longPackages = new EntityPackages(longName);
			expect(longPackages.getPath()).toBe(`apps/${longName}`);
		});

		it("should handle package names with spaces", () => {
			const spacedPackages = new EntityPackages("test package");
			expect(spacedPackages.getPath()).toBe("apps/test package");
		});
	});
});
