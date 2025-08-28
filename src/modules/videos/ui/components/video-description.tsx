import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"

interface VideoDescriptionProps {
    compactViews: string
    compactDate: string
    expandedViews: string
    expandedDate: string
    description?: string | null
}

export const VideoDescription = ({ compactDate, compactViews, description, expandedDate, expandedViews }: VideoDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>()

    return (
        <div
            onClick={() => setIsExpanded((current) => !current)}
            className="p-3 rounded-xl cursor-pointer bg-secondary/50 hover:bg-secondary/70 transition-colors"
        >
            <div className="flex gap-2 text-sm mb-2">
                <span className="font-medium">
                    {isExpanded ? expandedViews : compactViews} views
                </span>
                <span className="font-medium">
                    {isExpanded ? expandedDate : compactDate}
                </span>
            </div>
            <div className="relative">
                <p className={cn(
                    `text-sm whitespace-pre-wrap`,
                    !isExpanded && `line-clamp-2`
                )}>
                    {description || `No description`}
                </p>
                <div className="text-sm font-medium flex items-center gap-1 mt-4">
                    <Button
                        type="button"
                        variant={`purple_secondary`}
                        size={`sm`}
                        className="rounded-full">
                        {isExpanded ?
                            <>
                                Show less <ChevronUpIcon className="size-4" />
                            </> :
                            <>
                                Show more <ChevronDownIcon className="size-4" />
                            </>
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}