export type PackageExportValue =
	| string
	| {
			readonly types: string;
			readonly default: string;
	  };

export function toSourceExport(exportPath: string): PackageExportValue {
	if (exportPath.endsWith(".css")) {
		return exportPath;
	}

	return {
		types: exportPath,
		default: exportPath,
	};
}
