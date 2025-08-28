"use client"

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const SearchInput = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get(`query`) || ''
  const categoryId = searchParams.get(`categoryId`) || ''
  const [value, setValue] = useState<string>(query)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const url = new URL(`/search`, APP_URL)
    const newQuery = value.trim()

    url.searchParams.set("query", encodeURIComponent(newQuery))
    if (categoryId) {
      url.searchParams.set('categoryId', categoryId)
    }
    if (newQuery === "") {
      url.searchParams.delete("query")
    }
    setValue(newQuery)
    router.push(url.toString())
  }

  return (
    <form
      className="flex w-full max-w-[600px] border border-gray-200 rounded-full 
      focus-within:border-purple-500"
      onSubmit={handleSearch}
    >
      <div className="relative w-full">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Search"
          className="w-full pl-3 md:pl-4 py-1.5 md:py-2 pr-11 md:pr-12.5 rounded-l-full 
          text-sm md:text-base placeholder:text-sm md:placeholder:text-base focus:outline-none"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setValue("")}
            className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full 
            size-8 md:size-9 cursor-pointer text-gray-500 hover:text-purple-500"
          >
            <XIcon className="" />
          </Button>
        )}
      </div>
      <button
        disabled={!value.trim()}
        type="submit"
        className="px-4 md:px-5 py-2 md:py-2.5 hover:text-purple-500 bg-gray-100 hover:bg-gray-200 
        rounded-r-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};
