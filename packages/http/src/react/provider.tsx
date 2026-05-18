import {
	createContext,
	createElement,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";

import type { FetcherSettings } from "../fetcher/settings";
import { fetcherSettings } from "../fetcher/singleton";
import type { FetcherSettingsRootApplyInput } from "../fetcher/types";

function applySettings(input: FetcherSettingsRootApplyInput) {
	fetcherSettings.setSettings(input);
	return fetcherSettings.mutationGeneration;
}

export type FetcherSettingsContextValue = {
	readonly settings: FetcherSettings;
	readonly setSettings: (input: FetcherSettingsRootApplyInput) => void;
	readonly generation: number;
};

const FetcherSettingsContext = createContext<FetcherSettingsContextValue | null>(null);

type FetcherSettingsProviderProps = {
	readonly initialSettings: FetcherSettingsRootApplyInput;
	readonly children: ReactNode;
};

export const FetcherSettingsProvider = ({
	initialSettings,
	children,
}: FetcherSettingsProviderProps) => {
	const [generation, setGeneration] = useState(() => applySettings(initialSettings));

	const setSettings = useCallback(
		(input: FetcherSettingsRootApplyInput) => setGeneration(applySettings(input)),
		[],
	);

	const value = useMemo<FetcherSettingsContextValue>(
		() => ({
			settings: fetcherSettings,
			setSettings,
			generation,
		}),
		[setSettings, generation],
	);

	return createElement(FetcherSettingsContext.Provider, { value }, children);
};
