"use client";

import type { ReactFormExtendedApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDebouncedCallback } from "@packages/shared-react/useDebouncedCallback";

import type { ParsedUrlQueryInput } from "./queryTypes";
import { stableStringify } from "./types";

type ListFormMode = "onchange" | "manual";

type UseListFormStateOptions = {
	readonly mode?: ListFormMode;
	readonly debounceMs?: number;
};

export type UseListFormReturn<TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput> =
	ReactFormExtendedApi<
		TValues,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined
	> & {
		readonly submit: () => void;
		readonly reset: (values?: Partial<TValues>) => void;
		readonly setValues: (value: Partial<TValues>) => void;
		readonly getValues: () => TValues;
	};

const DEFAULT_MODE = "onchange";
const DEFAULT_DEBOUNCE_MS = 300;

export function useListFormState<TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	defaultValues?: Partial<TValues>,
	onChange?: (values: TValues) => void,
	options?: UseListFormStateOptions,
) {
	const { mode = DEFAULT_MODE, debounceMs = DEFAULT_DEBOUNCE_MS } = options ?? {};

	const defaultValuesRef = useRef(defaultValues);
	const [effectiveValues, setEffectiveValues] = useState<TValues>(
		() => (defaultValues ?? {}) as TValues,
	);

	const form = useForm({
		defaultValues: (defaultValues ?? {}) as TValues,
		onSubmit: ({ value }) => {
			setEffectiveValues(value);
			onChange?.(value);
		},
	});

	const submit = useDebouncedCallback(
		async () => {
			await form.handleSubmit();
		},
		[form],
		debounceMs,
	);

	const reset = useDebouncedCallback(
		(values?: Partial<TValues>) => {
			form.reset((values ?? defaultValuesRef.current ?? {}) as TValues);
			void submit();
		},
		[form, submit],
		debounceMs,
	);

	const setValues = useMemo(
		() => (value: Partial<TValues>) => {
			form.reset({ ...form.state.values, ...value } as TValues);
		},
		[form],
	);

	const getValues = useMemo(() => () => form.state.values as TValues, [form]);

	const formApi = useMemo(
		() =>
			Object.assign(form, {
				submit: () => {
					void submit();
				},
				reset,
				setValues,
				getValues,
			}) as UseListFormReturn<TValues>,
		[form, submit, reset, setValues, getValues],
	);

	/** When the router search changes, `defaultValues` updates but `submit` was never run — keep the form + `effectiveValues` in sync so UI (e.g. filter counts) and query keys match the URL. */
	const syncedParamsKey = useMemo(() => stableStringify(defaultValues ?? {}), [defaultValues]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: only re-sync when URL/search-derived params change (`syncedParamsKey`)
	useEffect(() => {
		defaultValuesRef.current = defaultValues;
		const next = (defaultValues ?? {}) as TValues;
		form.reset(next);
		setEffectiveValues(next);
		// Only re-sync when URL/search-derived params change (see `syncedParamsKey`).
	}, [syncedParamsKey, form]);

	useEffect(() => {
		if (mode !== DEFAULT_MODE) return;
		const subscription = form.store.subscribe(() => {
			void submit();
		});
		return () => subscription.unsubscribe();
	}, [form, mode, submit]);

	return [formApi, effectiveValues] as [UseListFormReturn<TValues>, TValues];
}
