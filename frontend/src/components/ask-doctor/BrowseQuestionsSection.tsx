"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { SectionEyebrow, SectionTitle } from "@/components/public/section-heading";
import { formatStatCount, specialtyEmoji } from "@/lib/data-mappers";
import {
  useAskDoctorCategories,
  useAskDoctorQuestionsInfinite,
} from "@/services/api-hooks";
import { QuestionCard } from "./QuestionCard";
import { QuestionFeedSkeleton } from "./QuestionCardSkeleton";
import { QuestionSearchBar } from "./QuestionSearchBar";

const PAGE_SIZE = 6;

type BrowseQuestionsSectionProps = {
  answeredCount?: number;
  activeCategory?: string;
};

export function BrowseQuestionsSection({
  answeredCount,
  activeCategory,
}: BrowseQuestionsSectionProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: categories } = useAskDoctorCategories();

  const handleSearchApply = useCallback((normalized: string) => {
    setSearchQuery(normalized);
  }, []);

  useEffect(() => {
    if (activeCategory) {
      setActiveFilter(activeCategory);
      feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeCategory]);

  const categoryParam = activeFilter === "all" ? undefined : activeFilter;

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useAskDoctorQuestionsInfinite({
    limit: PAGE_SIZE,
    category: categoryParam,
    search: searchQuery || undefined,
  });

  const isSearchLoading = isFetching && !isFetchingNextPage && !isLoading;

  useEffect(() => {
    if (isError && error) {
      console.error("[BrowseQuestions] Failed to load questions:", error);
    }
  }, [isError, error]);

  const questions = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const categoryFilters = useMemo(
    () => [
      { val: "all", label: "All Categories" },
      ...(categories ?? []).map((c) => ({
        val: c.name,
        label: `${specialtyEmoji(c.name)} ${c.name}`,
      })),
    ],
    [categories],
  );

  const handleFilter = (val: string) => {
    setActiveFilter(val);
  };

  const subtitleCount = answeredCount != null ? formatStatCount(answeredCount) : "—";
  const hasActiveSearch = searchQuery.length > 0;

  const devErrorMessage = isAxiosError(error)
    ? `${error.response?.status ?? "Network"}: ${error.response?.data?.message ?? error.message}`
    : error instanceof Error
      ? error.message
      : null;

  const showInitialSkeleton = isLoading;
  const showSearchSkeleton = isSearchLoading && questions.length === 0;

  return (
    <div>
      <SectionEyebrow className="section-eyebrow">Browse Questions</SectionEyebrow>
      <SectionTitle as="div" className="section-title !text-3xl">
        Featured Answered Questions
      </SectionTitle>
      <div className="section-sub">
        Browse {subtitleCount} questions answered by our specialist doctors. Use the search and
        filters to find answers relevant to you.
      </div>

      <QuestionSearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSearch={handleSearchApply}
        isSearching={isSearchLoading}
      />

      <div className="cat-filters" role="tablist" aria-label="Filter by category">
        {categoryFilters.map(({ val, label }) => (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={activeFilter === val}
            className={`cat-pill${activeFilter === val ? " active" : ""}`}
            onClick={() => handleFilter(val)}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="qa-feed" ref={feedRef} className={isSearchLoading ? "qa-feed--loading" : ""}>
        {showInitialSkeleton || showSearchSkeleton ? (
          <QuestionFeedSkeleton count={3} />
        ) : isError ? (
          <div className="no-results">
            <div className="no-results-icon">⚠️</div>
            <p>Unable to load questions right now. Please try again shortly.</p>
            {process.env.NODE_ENV === "development" && devErrorMessage && (
              <p className="qa-dev-error">{devErrorMessage}</p>
            )}
          </div>
        ) : questions.length > 0 ? (
          <>
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
            {hasNextPage && (
              <div className="qa-load-more-wrap">
                <button
                  type="button"
                  className="qa-load-more-btn"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading…" : "Load More Questions"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p>{hasActiveSearch ? "No questions found." : "No questions match your filters."}</p>
            <p className="no-results-hint">
              {hasActiveSearch
                ? "Try searching with different keywords."
                : "Try a different category or clear your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
