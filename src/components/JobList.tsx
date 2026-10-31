import { useState, useEffect, useRef, useCallback } from "react";
import JobItem from "./JobItem";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { type JobApplication } from "../types/job";

type JobListProps = {
  jobs: JobApplication[];
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
  onViewDetails?: (job: JobApplication) => void;
};

const BATCH_SIZE = 6;

function JobList({ jobs, onDeleteJob, onEditJob, onViewDetails }: JobListProps) {
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount whenever the jobs array changes (e.g. searching or filtering)
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [jobs]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= jobs.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, jobs.length));
      setIsLoadingMore(false);
    }, 400);
  }, [isLoadingMore, visibleCount, jobs.length]);

  // Infinite scroll listener using IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant text-sm font-medium">
        No applications match this filter.
      </div>
    );
  }

  const visibleJobs = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {visibleJobs.map((job) => (
          <JobItem
            key={job.id}
            job={job}
            onRequestDelete={setJobToDelete}
            onEditJob={onEditJob}
            onViewDetails={onViewDetails}
          />
        ))}

        {/* Skeleton animation while loading next batch of cards */}
        {isLoadingMore &&
          Array.from({ length: Math.min(3, jobs.length - visibleCount) }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 animate-pulse flex flex-col justify-between h-48"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 bg-surface-container-highest rounded-md" />
                  <div className="h-5 w-16 bg-surface-container-highest rounded-full" />
                </div>
                <div className="h-4 w-40 bg-surface-container-highest/60 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-surface-container-highest/40 rounded" />
                <div className="h-3 w-32 bg-surface-container-highest/30 rounded" />
              </div>
            </div>
          ))}
      </div>

      {/* Sentinel element to trigger infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-xs font-medium text-primary-container">
              <span className="w-3.5 h-3.5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
              <span>Loading more applications...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={loadMore}
              className="text-xs text-on-surface-variant hover:text-on-surface hover:underline cursor-pointer"
            >
              Scroll or click to load more
            </button>
          )}
        </div>
      )}

      {jobToDelete && (
        <ConfirmDeleteModal
          job={jobToDelete}
          onConfirm={() => {
            onDeleteJob(jobToDelete.id);
            setJobToDelete(null);
          }}
          onCancel={() => setJobToDelete(null)}
        />
      )}
    </>
  );
}

export default JobList;
