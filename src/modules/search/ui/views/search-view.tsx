import { CategoriesSection } from "@/modules/search/ui/sections/categories-section"
import { ResultsSection } from "@/modules/search/ui/sections/results-section"

interface SearchViewProps {
    query: string | undefined
    categoryId: string | undefined
}

export const SearchView = ({ categoryId, query }: SearchViewProps) => {
    return (
        <div className="flex flex-col gap-y-6 px-4 pt-2.5 max-w-325 mx-auto mb-2">
            <CategoriesSection categoryId={categoryId} />
            <ResultsSection categoryId={categoryId} query={query} />
        </div>
    )
}