"use client";

import type { QueryKey } from "@tanstack/react-query";
import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";

import type { ListFetcher, ListFetcherParamsBase } from "./types";
import { type UseVirtualListOptions, useVirtualList } from "./useVirtualList";
import type { VirtualScrollSnapshot } from "./useVirtualList.utils";

export type VirtualListProps<TParams extends ListFetcherParamsBase, TItem> = {
	readonly queryKey: QueryKey;
	readonly fetcher: ListFetcher<TParams, TItem[]>;
	readonly className?: string;
	readonly viewportClassName?: string;
	readonly rowClassName?: string;
	readonly loaderClassName?: string;
	readonly role?: string;
	readonly ariaLabel?: string;
	readonly ariaBusy?: boolean;
	readonly loadingMoreAriaLabel?: string;
	readonly renderItem: (props: { readonly item: TItem; readonly index: number }) => ReactNode;
	readonly renderLoader?: (props: {
		readonly style: CSSProperties;
		readonly measureRef: (node: HTMLElement | null) => void;
		readonly ariaLabel: string;
	}) => ReactNode;
	readonly renderEmpty?: () => ReactNode;
	readonly containerRef?: Ref<HTMLElement>;
} & UseVirtualListOptions<TParams, TItem>;

const defaultLoaderStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "1rem",
};

export function VirtualList<TParams extends ListFetcherParamsBase, TItem>({
	queryKey,
	fetcher,
	className,
	viewportClassName,
	rowClassName,
	loaderClassName,
	role = "feed",
	ariaLabel,
	ariaBusy,
	loadingMoreAriaLabel = "Loading more",
	renderItem,
	renderLoader,
	renderEmpty,
	containerRef: externalContainerRef,
	...options
}: VirtualListProps<TParams, TItem>): ReactElement {
	const {
		list: [items, isPending],
		virtual,
		pagination,
	} = useVirtualList(queryKey, fetcher, options);
	const isEmpty = !isPending && items.length === 0;

	const setContainerRef = (node: HTMLElement | null) => {
		virtual.containerRef.current = node;
		if (typeof externalContainerRef === "function") {
			externalContainerRef(node);
		} else if (externalContainerRef != null) {
			(externalContainerRef as { current: HTMLElement | null }).current = node;
		}
	};

	if (isEmpty && renderEmpty != null) {
		return <section className={className}>{renderEmpty()}</section>;
	}

	const feedBusy = ariaBusy ?? (pagination.isFetchingNextPage || !virtual.showViewport);

	return (
		<section
			ref={setContainerRef}
			className={className}
			role={role}
			aria-label={ariaLabel}
			aria-busy={feedBusy}
		>
			{virtual.showViewport ? (
				<div
					className={viewportClassName}
					style={{ position: "relative", width: "100%", height: virtual.totalSize }}
				>
					{virtual.virtualItems.map((virtualRow) => {
						const positionStyle = virtual.getRowStyle(virtualRow.start);
						const isLoaderRow = virtual.isLoaderRow(virtualRow.index);

						if (isLoaderRow) {
							const loaderProps = {
								style: { ...positionStyle, ...defaultLoaderStyle },
								measureRef: virtual.measureRow,
								ariaLabel: loadingMoreAriaLabel,
							};

							if (renderLoader != null) {
								return (
									<div
										key={virtualRow.key}
										ref={virtual.measureRow}
										data-index={virtualRow.index}
										style={loaderProps.style}
									>
										{renderLoader(loaderProps)}
									</div>
								);
							}

							return (
								<p
									key={virtualRow.key}
									ref={virtual.measureRow}
									data-index={virtualRow.index}
									className={loaderClassName}
									style={loaderProps.style}
									role="status"
									aria-live="polite"
									aria-label={loadingMoreAriaLabel}
								/>
							);
						}

						const item = virtual.getItemAt(virtualRow.index);
						if (item === undefined) return null;

						return (
							<article
								key={virtualRow.key}
								ref={virtual.measureRow}
								data-index={virtualRow.index}
								className={rowClassName}
								style={positionStyle}
								aria-posinset={virtualRow.index + 1}
								aria-setsize={items.length}
							>
								{renderItem({ item, index: virtualRow.index })}
							</article>
						);
					})}
				</div>
			) : null}
		</section>
	);
}

/** @deprecated Use `VirtualList` — kept for apps that imported `VirtualFeedList`. */
export const VirtualFeedList = VirtualList;

export type { VirtualScrollSnapshot };
