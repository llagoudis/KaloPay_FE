"use client";

import { useState } from "react";
import { PAGINATION_LIMIT } from "@/lib/constants/config";

export function usePagination(initialPage = 1, limit = PAGINATION_LIMIT) {
  const [page, setPage] = useState(initialPage);

  function goToPage(newPage: number) {
    setPage(newPage);
  }

  function nextPage() {
    setPage((p) => p + 1);
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function reset() {
    setPage(1);
  }

  return { page, limit, goToPage, nextPage, prevPage, reset };
}
