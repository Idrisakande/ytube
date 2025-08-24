'use client'

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { CommentGetManyOutput } from "@/modules/comments/type";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon, MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CommentReactions } from "@/modules/comments/ui/components/comment-reactions";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { useState } from "react";
import { CommentReplies } from '@/modules/comments/ui/components/comment-replies';


interface CommentItemProps {
    comment: CommentGetManyOutput[`data`][number]
    variant?: `reply` | `comment`
}

export const CommentItem = ({ comment, variant = `comment` }: CommentItemProps) => {
    const [isReplyOpen, setIsReplyOpen] = useState<boolean>(false)
    const [isRepliesOpen, setIsRepliesOpen] = useState<boolean>(false)
    const { userId } = useAuth()
    const clerk = useClerk()
    const utils = trpc.useUtils()

    const deleteComment = trpc.comments.deleteComments.useMutation({
        onSuccess: () => {
            toast.success(`Comment deleted`)
            utils.comments.getMany.invalidate({ videoId: comment.videoId })
        },
        onError: (error) => {
            if (error.data?.code === `UNAUTHORIZED`) {
                clerk.openSignIn()
                toast.error(`Please sign in`)
                return
            }
            toast.error(`Something went wrong`)
        },
    })
    const onSuccessReply = () => {
        setIsReplyOpen(false)
        setIsRepliesOpen(true)
    }

    return (
        <div>
            <div className="flex gap-3">
                <Link prefetch  href={`/users/${comment.userId}`}>
                    <UserAvatar
                        size={variant === `comment` ? `lg` : `sm`}
                        imageUrl={comment.user.imageUrl}
                        name={comment.user.name}
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link prefetch  href={`/users/${comment.userId}`} className="sm:flex sm:w-fit">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium pb-0.5">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>

                        </div>
                    </Link>
                    <p className="text-sm">{comment.value}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <CommentReactions
                            commentId={comment.id}
                            likeCount={comment.likeCount}
                            dislikeCount={comment.dislikeCount}
                            viwerReaction={comment.viewerReactions}
                            videoId={comment.videoId}
                        />
                        {variant === `comment` && (
                            <Button
                                variant={`ghost`}
                                size={`sm`}
                                onClick={() => setIsReplyOpen(true)}
                                className="rounded-full cursor-pointer text-xs"
                            >Reply
                            </Button>
                        )}
                    </div>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant={`ghost`} size={`icon`} className="size-8 rounded-full cursor-pointer" >
                            <MoreVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {variant === `comment` && (
                            <DropdownMenuItem onClick={() => setIsReplyOpen(true)} className="cursor-pointer">
                                <MessageSquareIcon className="size-4" />
                                Reply
                            </DropdownMenuItem>
                        )}
                        {comment.user.clerkId === userId && (
                            <DropdownMenuItem onClick={() => deleteComment.mutate({ id: comment.id })} className="cursor-pointer">
                                <Trash2Icon className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {isReplyOpen && variant === `comment` && (
                <div className="pl-14 mt-3">
                    <CommentForm
                        variant="reply"
                        parentId={comment.id}
                        videoId={comment.videoId}
                        onSuccess={onSuccessReply}
                        onCancel={() => setIsReplyOpen(false)}
                    />
                </div>
            )}
            {comment.replyCount > 0 && variant === `comment` && (
                <div className="pl-14">
                    <Button
                        type="button"
                        size={`sm`}
                        variant={"green_variant"}
                        onClick={() => setIsRepliesOpen((current) => !current)}
                        className="cursor-pointer">
                        {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        {comment.replyCount} repliess
                    </Button>
                </div>
            )}
            {comment.replyCount > 0 && variant === `comment` && isRepliesOpen && (
                <CommentReplies
                    parentId={comment.id}
                    videoId={comment.videoId}
                />
            )}
        </div>
    )

}
