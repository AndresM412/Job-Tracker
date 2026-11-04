import React from "react";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar lista de números de página con elipsis inteligente
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div
      data-testid="pagination-controls"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 text-xs text-on-surface-variant font-medium select-none"
    >
      {/* 1. Texto informativo a la izquierda */}
      <div className="text-on-surface-variant">
        Showing <span className="font-semibold text-on-surface">{startIndex}</span> to{" "}
        <span className="font-semibold text-on-surface">{endIndex}</span> of{" "}
        <span className="font-semibold text-on-surface">{totalItems}</span> applications
      </div>

      {/* 2. Botón central Load More (como en el mockup) */}
      {currentPage < totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          data-testid="load-more-btn"
          className="px-4 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          Load More
        </button>
      )}

      {/* 3. Controles numéricos a la derecha */}
      <div className="flex items-center gap-1.5">
        {/* Anterior */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        {/* Páginas numéricas */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-outline">
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? "border border-secondary text-secondary bg-secondary/10 shadow-xs"
                  : "border border-outline-variant/30 text-on-surface hover:bg-surface-container hover:border-outline-variant/60"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Siguiente */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
