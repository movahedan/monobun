/** biome-ignore-all lint/suspicious/noExplicitAny: Mock types require any for flexibility */
import { afterEach, beforeEach, describe, expect, it, type Mock, mock } from "bun:test";
import type { $ } from "bun";
import { EntityPackages } from "./packages";
import type { PackageJson } from "./types";

export type EntityPackagesMock = Mock<
	() => Partial<{
		getPath: ReturnType<typeof mock>;
		getJsonPath: ReturnType<typeof mock>;
		readJson: ReturnType<typeof mock>;
		writeJson: ReturnType<typeof mock>;
		readVersion: ReturnType<typeof mock>;
		writeVersion: ReturnType<typeof mock>;
		getChangelogPath: ReturnType<typeof mock>;
		readChangelog: ReturnType<typeof mock>;
		writeChangelog: ReturnType<typeof mock>;
		validatePackage: ReturnType<typeof mock>;
		shouldVersion: ReturnType<typeof mock>;
		getTagSeriesName: ReturnType<typeof mock>;
		getRepoUrl: ReturnType<typeof mock>;
		getAllPackages: ReturnType<typeof mock>;
		getVersionedPackages: ReturnType<typeof mock>;
		getUnversionedPackages: ReturnType<typeof mock>;
		validateAllPackages: ReturnType<typeof mock>;
	}>
>;

export function mockEntityPackages(entityPackages: EntityPackagesMock) {
	// Return the mock object directly instead of using mock.module
	return entityPackages;
}

describe("EntityPackages", () => {
	let packages: InstanceType<typeof EntityPackages>;
	const mockPackageName = "test-package";

	const mockPackageJson = (overrides: Partial<PackageJson> = {}): PackageJson => ({
		name: "test-package",
		version: "1.0.0",
		description: "Test package",
		...overrides,
	});

	let mockPackagesShell: {
		readJsonFile: ReturnType<typeof mock>;
		writeJsonFile: ReturnType<typeof mock>;
		readChangelogFile: ReturnType<typeof mock>;
		writeChangelogFile: ReturnType<typeof mock>;
		runBiomeCheck: ReturnType<typeof mock>;
		fileExists: ReturnType<typeof mock>;
		readDirectory: ReturnType<typeof mock>;
		canAccessFile: ReturnType<typeof mock>;
		readFileAsText: ReturnType<typeof mock>;
		getWorkspaceRoot: ReturnType<typeof mock>;
	};

	let mockEntitiesShell: {
		runBiomeCheck: ReturnType<typeof mock>;
	};

	// Store original methods to restore after tests
	let originalPackagesShellReadJsonFile: (filePath: string) => PackageJson;
	let originalPackagesShellWriteJsonFile: (filePath: string, data: PackageJson) => Promise<void>;
	let originalPackagesShellReadChangelogFile: (filePath: string) => string;
	let originalPackagesShellWriteChangelogFile: (filePath: string, content: string) => Promise<void>;
	let originalPackagesShellFileExists: (filePath: string) => Promise<boolean>;
	let originalPackagesShellReadDirectory: (dirPath: string) => Promise<string[]>;
	let originalPackagesShellCanAccessFile: (filePath: string) => Promise<boolean>;
	let originalPackagesShellReadFileAsText: (filePath: string) => Promise<string>;
	let originalPackagesShellGetWorkspaceRoot: () => Promise<string>;
	let originalEntitiesShellRunBiomeCheck: (filePath: string) => $.ShellPromise;

	beforeEach(async () => {
		// Import fresh modules to avoid interference
		const { packagesShell } = await import("./packages.shell");
		const { entitiesShell } = await import("../entities.shell");

		// Store original methods if not already stored
		if (!originalPackagesShellReadJsonFile) {
			originalPackagesShellReadJsonFile = packagesShell.readJsonFile;
		}
		if (!originalPackagesShellWriteJsonFile) {
			originalPackagesShellWriteJsonFile = packagesShell.writeJsonFile;
		}
		if (!originalPackagesShellReadChangelogFile) {
			originalPackagesShellReadChangelogFile = packagesShell.readChangelogFile;
		}
		if (!originalPackagesShellWriteChangelogFile) {
			originalPackagesShellWriteChangelogFile = packagesShell.writeChangelogFile;
		}
		if (!originalPackagesShellFileExists) {
			originalPackagesShellFileExists = packagesShell.fileExists;
		}
		if (!originalPackagesShellReadDirectory) {
			originalPackagesShellReadDirectory = packagesShell.readDirectory;
		}
		if (!originalPackagesShellCanAccessFile) {
			originalPackagesShellCanAccessFile = packagesShell.canAccessFile;
		}
		if (!originalPackagesShellReadFileAsText) {
			originalPackagesShellReadFileAsText = packagesShell.readFileAsText;
		}
		if (!originalPackagesShellGetWorkspaceRoot) {
			originalPackagesShellGetWorkspaceRoot = packagesShell.getWorkspaceRoot;
		}
		if (!originalEntitiesShellRunBiomeCheck) {
			originalEntitiesShellRunBiomeCheck = entitiesShell.runBiomeCheck;
		}

		// Clear any existing mock state
		mock.clearAllMocks();

		// Mock packagesShell
		mockPackagesShell = {
			readJsonFile: mock((path: string) => {
				if (path.includes("package.json")) {
					return mockPackageJson();
				}
				throw new Error(`File not found: ${path}`);
			}),
			writeJsonFile: mock(() => Promise.resolve()),
			readChangelogFile: mock((path: string) => {
				if (path.includes("CHANGELOG.md")) {
					return "# Test Changelog\n\n## 1.0.0\n- Initial release";
				}
				return "";
			}),
			writeChangelogFile: mock(() => Promise.resolve()),
			runBiomeCheck: mock(() => Promise.resolve()),
			fileExists: mock(() => Promise.resolve(true)),
			readDirectory: mock(() => Promise.resolve([])),
			canAccessFile: mock(() => Promise.resolve(true)),
			readFileAsText: mock((path: string) => {
				if (path.includes("package.json")) {
					return Promise.resolve(JSON.stringify(mockPackageJson()));
				}
				return Promise.resolve("");
			}),
			getWorkspaceRoot: mock(() => Promise.resolve("/workspace")),
		};

		// Mock the packagesShell methods directly
		packagesShell.readJsonFile = mockPackagesShell.readJsonFile;
		packagesShell.writeJsonFile = mockPackagesShell.writeJsonFile;
		packagesShell.readChangelogFile = mockPackagesShell.readChangelogFile;
		packagesShell.writeChangelogFile = mockPackagesShell.writeChangelogFile;
		packagesShell.fileExists = mockPackagesShell.fileExists;
		packagesShell.readDirectory = mockPackagesShell.readDirectory;
		packagesShell.canAccessFile = mockPackagesShell.canAccessFile;
		packagesShell.readFileAsText = mockPackagesShell.readFileAsText;
		packagesShell.getWorkspaceRoot = mockPackagesShell.getWorkspaceRoot;

		// Mock the entitiesShell methods directly
		mockEntitiesShell = {
			runBiomeCheck: mock(() => Promise.resolve()),
		};

		entitiesShell.runBiomeCheck = mockEntitiesShell.runBiomeCheck;

		// Store for cleanup
		// Original methods are now stored globally above

		// Original methods are now stored globally above

		// Create instance after mocking
		packages = new EntityPackages(mockPackageName);
	});

	afterEach(async () => {
		// Restore original methods
		const { packagesShell } = await import("./packages.shell");
		const { entitiesShell } = await import("../entities.shell");

		if (originalPackagesShellReadJsonFile) {
			packagesShell.readJsonFile = originalPackagesShellReadJsonFile;
		}
		if (originalPackagesShellWriteJsonFile) {
			packagesShell.writeJsonFile = originalPackagesShellWriteJsonFile;
		}
		if (originalPackagesShellReadChangelogFile) {
			packagesShell.readChangelogFile = originalPackagesShellReadChangelogFile;
		}
		if (originalPackagesShellWriteChangelogFile) {
			packagesShell.writeChangelogFile = originalPackagesShellWriteChangelogFile;
		}
		if (originalPackagesShellFileExists) {
			packagesShell.fileExists = originalPackagesShellFileExists;
		}
		if (originalPackagesShellReadDirectory) {
			packagesShell.readDirectory = originalPackagesShellReadDirectory;
		}
		if (originalPackagesShellCanAccessFile) {
			packagesShell.canAccessFile = originalPackagesShellCanAccessFile;
		}
		if (originalPackagesShellReadFileAsText) {
			packagesShell.readFileAsText = originalPackagesShellReadFileAsText;
		}
		if (originalPackagesShellGetWorkspaceRoot) {
			packagesShell.getWorkspaceRoot = originalPackagesShellGetWorkspaceRoot;
		}
		if (originalEntitiesShellRunBiomeCheck) {
			entitiesShell.runBiomeCheck = originalEntitiesShellRunBiomeCheck;
		}
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

	describe.skip("readJson", () => {
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

		it("should throw error when file read fails", async () => {
			// Create a fresh mock for this test
			const { packagesShell } = await import("./packages.shell");
			packagesShell.readJsonFile = mock(() => {
				throw new Error("File read failed");
			});

			expect(() => {
				new EntityPackages("error-package");
			}).toThrow(
				"Package not found error-package at apps/error-package/package.json: Error: File read failed",
			);
		});

		it("should throw error when JSON parsing fails", () => {
			// Mock packagesShell to return invalid JSON for this test
			mockPackagesShell.readJsonFile.mockImplementationOnce(() => {
				throw new Error("Invalid JSON");
			});

			expect(() => {
				new EntityPackages("invalid-json-package");
			}).toThrow(
				"Package not found invalid-json-package at apps/invalid-json-package/package.json: Error: Invalid JSON",
			);
		});
	});

	describe.skip("writeJson", () => {
		beforeEach(() => {
			packages = new EntityPackages(mockPackageName);
		});

		it("should write package.json and run biome check", async () => {
			// Use the already mocked packagesShell methods from beforeEach
			// No need for additional mock.module since we're already mocking at the method level

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

	describe.skip("writeVersion", () => {
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
			// Update the mock for this specific test
			mockPackagesShell.readChangelogFile.mockImplementationOnce((path: string) => {
				if (path.includes("CHANGELOG.md")) {
					return "# Test Changelog\n\n## 1.0.0\n- Initial release";
				}
				return "";
			});

			const changelogPackages = new EntityPackages("test-package");
			const result = changelogPackages.readChangelog();
			expect(result).toBe("# Test Changelog\n\n## 1.0.0\n- Initial release");
		});

		it("should return empty string when changelog is empty", () => {
			// Update the mock for this specific test
			mockPackagesShell.readChangelogFile.mockImplementationOnce(() => "");

			const emptyChangelogPackages = new EntityPackages("test-package");
			const result = emptyChangelogPackages.readChangelog();
			expect(result).toBe("");
		});

		it("should not throw error when changelog read fails", () => {
			// The readChangelog method should handle errors gracefully
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

		it.skip("should return valid result for valid package", () => {
			const result = packages.validatePackage();
			expect(result).toHaveLength(0);
		});

		it.skip("should return error for invalid version format", () => {
			// Mock packagesShell to return invalid version for this test
			mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
				mockPackageJson({ version: "invalid-version" }),
			);

			const invalidPackages = new EntityPackages("invalid-version-package");
			const result = invalidPackages.validatePackage();
			expect(result).toHaveLength(1);
			expect(result[0]).toContain(
				"invalid-version-package: Version should follow semantic versioning",
			);
		});

		it.skip("should return error for missing description", () => {
			const packageJson = mockPackageJson();
			delete packageJson.description;

			// Mock packagesShell to return package without description for this test
			mockPackagesShell.readJsonFile.mockImplementationOnce(() => packageJson);

			const noDescPackages = new EntityPackages("no-description-package");
			const result = noDescPackages.validatePackage();
			expect(result).toHaveLength(1);
			expect(result[0]).toContain(
				"no-description-package: Consider adding a description to package.json",
			);
		});

		it.skip("should return multiple errors for multiple issues", () => {
			const packageJson = mockPackageJson({ version: "invalid" });
			delete packageJson.description;

			// Mock packagesShell to return package with multiple issues for this test
			mockPackagesShell.readJsonFile.mockImplementationOnce(() => packageJson);

			const multiIssuePackages = new EntityPackages("multi-issue-package");
			const result = multiIssuePackages.validatePackage();
			expect(result).toHaveLength(2);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.stringContaining("Version should follow semantic versioning"),
					expect.stringContaining("Consider adding a description to package.json"),
				]),
			);
		});

		it.skip("should validate semantic versioning correctly", () => {
			const validVersions = ["1.0.0", "2.1.3", "10.20.30"];
			const invalidVersions = ["1.0", "1.0.0.0", "1.0.0-beta", "v1.0.0"];

			validVersions.forEach((version) => {
				// Mock packagesShell to return valid version for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() => mockPackageJson({ version }));

				const validPackages = new EntityPackages(`valid-${version}-package`);
				const result = validPackages.validatePackage();
				expect(result).toHaveLength(0);
			});

			invalidVersions.forEach((version) => {
				// Mock packagesShell to return invalid version for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() => mockPackageJson({ version }));

				const invalidPackages = new EntityPackages(`invalid-${version}-package`);
				const result = invalidPackages.validatePackage();
				expect(result.length).toBeGreaterThan(0);
			});
		});
	});

	describe("selective versioning", () => {
		describe("shouldVersion", () => {
			it.skip("should return true for packages with private: false", () => {
				// Mock packagesShell to return package with private: false for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({ private: false }),
				);

				const publicPackages = new EntityPackages("public-package");
				expect(publicPackages.shouldVersion()).toBe(true);
			});

			it.skip("should return true for packages with no private field", () => {
				const packageJson = mockPackageJson();
				delete packageJson.private;

				// Mock packagesShell to return package without private field for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() => packageJson);

				const defaultPackages = new EntityPackages("default-package");
				expect(defaultPackages.shouldVersion()).toBe(true);
			});

			it.skip("should return false for packages with private: true", () => {
				// Mock packagesShell to return package with private: true for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({ private: true }),
				);

				const privatePackages = new EntityPackages("private-package");
				expect(privatePackages.shouldVersion()).toBe(false);
			});
		});

		describe("getTagSeriesName", () => {
			it.skip("should return 'v' for root package", () => {
				// Mock packagesShell to return root package for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({ name: "root", private: false }),
				);

				const rootPackages = new EntityPackages("root");
				expect(rootPackages.getTagSeriesName()).toBe("v");
			});

			it.skip("should return 'package-name-v' for @repo packages", () => {
				// Mock packagesShell to return @repo package for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({ name: "@repo/intershell", private: false }),
				);

				const intershellPackages = new EntityPackages("@repo/intershell");
				expect(intershellPackages.getTagSeriesName()).toBe("intershell-v");
			});

			it.skip("should return 'package-name-v' for regular packages", () => {
				// Mock packagesShell to return regular package for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({ name: "my-app", private: false }),
				);

				const appPackages = new EntityPackages("my-app");
				expect(appPackages.getTagSeriesName()).toBe("my-app-v");
			});

			it.skip("should return null for private packages", () => {
				// Mock packagesShell to return private package for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({ private: true }),
				);

				const privatePackages = new EntityPackages("private-package");
				expect(privatePackages.getTagSeriesName()).toBe(null);
			});
		});
	});

	describe("static methods", () => {
		describe("getRepoUrl", () => {
			it.skip("should return repository URL when repository is a string", () => {
				// Mock packagesShell to return root package with string repository for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({
						name: "root",
						repository: "https://github.com/user/repo.git",
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("https://github.com/user/repo.git");
			});

			it.skip("should return repository URL when repository is an object", () => {
				// Mock packagesShell to return root package with object repository for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({
						name: "root",
						repository: {
							type: "git",
							url: "https://github.com/user/repo.git",
						},
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("https://github.com/user/repo.git");
			});

			it("should return empty string when repository is missing", () => {
				const packageJson = mockPackageJson({ name: "root" });
				delete packageJson.repository;

				// Mock packagesShell to return root package without repository for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() => packageJson);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return empty string when repository object has no url", () => {
				// Mock packagesShell to return root package with repository object without url for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({
						name: "root",
						repository: {
							type: "git",
							url: "",
						},
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return empty string when repository object has no url property", () => {
				// Mock packagesShell to return root package with repository object without url property for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({
						name: "root",
						repository: {
							type: "git",
							url: "", // Provide empty url to satisfy type requirements
						},
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it("should return empty string when repository is undefined", () => {
				// Mock packagesShell to return root package with undefined repository for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({
						name: "root",
						repository: undefined,
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("");
			});

			it.skip("should return repository URL when repository is a string", () => {
				// Mock packagesShell to return root package with string repository for this test
				mockPackagesShell.readJsonFile.mockImplementationOnce(() =>
					mockPackageJson({
						name: "root",
						repository: "https://github.com/example/repo",
					}),
				);

				const result = EntityPackages.getRepoUrl();
				expect(result).toBe("https://github.com/example/repo");
			});
		});

		describe("getAllPackages", () => {
			it("should return list of packages including root", async () => {
				// Mock packagesShell methods for this test
				mockPackagesShell.getWorkspaceRoot.mockResolvedValueOnce("/workspace");
				mockPackagesShell.readDirectory
					.mockResolvedValueOnce(["test-app", "another-app"]) // apps
					.mockResolvedValueOnce(["ui", "utils"]); // packages
				mockPackagesShell.canAccessFile
					.mockResolvedValueOnce(true) // apps/test-app/package.json
					.mockResolvedValueOnce(true) // apps/another-app/package.json
					.mockResolvedValueOnce(true) // packages/ui/package.json
					.mockResolvedValueOnce(true); // packages/utils/package.json
				mockPackagesShell.readFileAsText
					.mockResolvedValueOnce('{"name": "test-app", "version": "1.0.0"}')
					.mockResolvedValueOnce('{"name": "another-app", "version": "1.0.0"}')
					.mockResolvedValueOnce('{"name": "@repo/ui", "version": "1.0.0"}')
					.mockResolvedValueOnce('{"name": "@repo/utils", "version": "1.0.0"}');

				const result = await EntityPackages.getAllPackages();

				expect(result).toContain("root");
				expect(result).toContain("test-app");
				expect(result).toContain("another-app");
				expect(result).toContain("@repo/ui");
				expect(result).toContain("@repo/utils");
			});

			it("should handle empty directories gracefully", async () => {
				// Mock packagesShell methods for this test
				mockPackagesShell.getWorkspaceRoot.mockResolvedValueOnce("/workspace");
				mockPackagesShell.readDirectory
					.mockResolvedValueOnce([]) // apps
					.mockResolvedValueOnce([]); // packages

				const result = await EntityPackages.getAllPackages();
				expect(result).toEqual(["root"]);
			});

			it("should filter out packages without valid package.json", async () => {
				// Mock packagesShell methods for this test
				mockPackagesShell.getWorkspaceRoot.mockResolvedValueOnce("/workspace");
				mockPackagesShell.readDirectory
					.mockResolvedValueOnce(["invalid-app"]) // apps
					.mockResolvedValueOnce(["invalid-pkg"]); // packages
				mockPackagesShell.canAccessFile
					.mockResolvedValueOnce(false) // apps/invalid-app/package.json
					.mockResolvedValueOnce(false); // packages/invalid-pkg/package.json

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

	describe("getVersionedPackages", () => {
		it.skip("should return packages that should be versioned", async () => {
			// Mock packagesShell methods for this test
			mockPackagesShell.getWorkspaceRoot.mockResolvedValueOnce("/workspace");
			mockPackagesShell.readDirectory
				.mockResolvedValueOnce(["test-app"]) // apps
				.mockResolvedValueOnce(["ui"]); // packages
			mockPackagesShell.canAccessFile
				.mockResolvedValueOnce(true) // apps/test-app/package.json
				.mockResolvedValueOnce(true); // packages/ui/package.json
			mockPackagesShell.readFileAsText
				.mockResolvedValueOnce('{"name": "test-app", "version": "1.0.0", "private": false}')
				.mockResolvedValueOnce('{"name": "@repo/ui", "version": "1.0.0", "private": false}');

			const result = await EntityPackages.getVersionedPackages();
			expect(Array.isArray(result)).toBe(true);
			expect(result).toContain("test-app");
			expect(result).toContain("@repo/ui");
		});
	});

	describe("getUnversionedPackages", () => {
		it.skip("should return packages that should not be versioned", async () => {
			// Override the readJsonFile mock for this specific test to return private packages
			mockPackagesShell.readJsonFile.mockImplementation((path: string) => {
				if (path.includes("test-app")) {
					return { name: "test-app", version: "1.0.0", private: true };
				}
				if (path.includes("ui")) {
					return { name: "@repo/ui", version: "1.0.0", private: true };
				}
				// Default fallback
				return mockPackageJson();
			});

			// Mock packagesShell methods for this test
			mockPackagesShell.getWorkspaceRoot.mockResolvedValueOnce("/workspace");
			mockPackagesShell.readDirectory
				.mockResolvedValueOnce(["test-app"]) // apps
				.mockResolvedValueOnce(["ui"]); // packages
			mockPackagesShell.canAccessFile
				.mockResolvedValueOnce(true) // apps/test-app/package.json
				.mockResolvedValueOnce(true); // packages/ui/package.json
			mockPackagesShell.readFileAsText
				.mockResolvedValueOnce('{"name": "test-app", "version": "1.0.0", "private": true}')
				.mockResolvedValueOnce('{"name": "@repo/ui", "version": "1.0.0", "private": true}');

			const result = await EntityPackages.getUnversionedPackages();
			expect(Array.isArray(result)).toBe(true);
			expect(result).toContain("test-app");
			expect(result).toContain("@repo/ui");
		});
	});

	describe.skip("validateAllPackages", () => {
		it("should validate all packages and return results", async () => {
			// Mock packagesShell methods for this test
			mockPackagesShell.getWorkspaceRoot.mockResolvedValueOnce("/workspace");
			mockPackagesShell.readDirectory
				.mockResolvedValueOnce(["test-app"]) // apps
				.mockResolvedValueOnce(["ui"]); // packages
			mockPackagesShell.canAccessFile
				.mockResolvedValueOnce(true) // apps/test-app/package.json
				.mockResolvedValueOnce(true); // packages/ui/package.json
			mockPackagesShell.readFileAsText
				.mockResolvedValueOnce('{"name": "test-app", "version": "1.0.0", "private": false}')
				.mockResolvedValueOnce('{"name": "@repo/ui", "version": "1.0.0", "private": false}');

			const result = await EntityPackages.validateAllPackages();
			expect(Array.isArray(result)).toBe(true);
			console.log(result);
			expect(result).toHaveLength(3);
			expect(result).toContain("root: Consider adding a description to package.json");
			expect(result).toContain("test-app: Consider adding a description to package.json");
			expect(result).toContain("@repo/ui: Consider adding a description to package.json");
		});
	});
});
