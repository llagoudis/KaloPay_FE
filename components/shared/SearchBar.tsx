"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <div className={className}>
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
