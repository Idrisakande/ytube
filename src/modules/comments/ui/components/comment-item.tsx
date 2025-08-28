'use client'

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { CommentGetManyOutput } from "@/modules/comments/type";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon, LogIn, MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CommentReactions } from "@/modules/comments/ui/components/comment-reactions";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { useState } from "react";
import { CommentReplies } from '@/modules/comments/ui/components/comment-replies';
import { cn } from "@/lib/utils";
import { DeleteModal } from "@/components/delete-modal";


interface CommentItemProps {
    comment: CommentGetManyOutput[`data`][number]
    variant?: `reply` | `comment`
}

export const CommentItem = ({ comment, variant = `comment` }: CommentItemProps) => {
    const [isReplyOpen, setIsReplyOpen] = useState<boolean>(false)
    const [isRepliesOpen, setIsRepliesOpen] = useState<boolean>(false)
    const [isMessageDeleteModalOpen, setIsMessageDeleteModalOpen] = useState<boolean>(false)
    const { userId, isSignedIn } = useAuth()
    const clerk = useClerk()
    const utils = trpc.useUtils()

    const deleteComment = trpc.comments.deleteComments.useMutation({
        onSuccess: () => {
            toast.success(`Comment deleted`)
            utils.comments.getMany.invalidate({ videoId: comment.videoId })
            setIsMessageDeleteModalOpen(false)
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
        <>
            <DeleteModal
                isOpen={isMessageDeleteModalOpen}
                onOpenChange={setIsMessageDeleteModalOpen}
                title={variant === `comment` ? `Delete the comment` : `Delete the reply`}
                actionText={variant === `comment` ? `Are you sure to delete this comment?` : `Are you sure to delete this reply?`}
                buttonText={`Delete`}
                onClick={() => deleteComment.mutate({ id: comment.id })}
                isPending={deleteComment.isPending}
            />
            <div>
                <div className={cn(`flex gap-3`,
                    variant === `reply` && `gap-2 sm:gap-3`
                )}>
                    <Link prefetch href={`/users/${comment.userId}`}>
                        <UserAvatar
                            size={variant === `comment` ? `default` : `sm`}
                            imageUrl={comment.user.imageUrl}
                            name={comment.user.name}
                        />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <Link prefetch href={`/users/${comment.userId}`} className="flex w-fit">
                            <div className={cn(`flex items-center gap-2 mb-0.5`,
                                variant === `reply` && `gap-0.5 sm:gap-2`
                            )}>
                                <span className={cn(`text-sm font-medium pb-0.5`,
                                    variant === `reply` && `truncate max-w-30 sm:max-w-60 line-clamp-1 `,
                                    variant === `comment` && `truncate max-w-30 sm:max-w-60 line-clamp-1  `,
                                )}>{comment.user.name}</span>
                                <span className={cn(`text-xs text-muted-foreground`,
                                    variant === `reply` && `text-[0.69rem] sm:text-xs`
                                )}>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>

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
                        <DropdownMenuTrigger asChild
                            onClick={(event) => {
                                if (!isSignedIn && !!userId) {
                                    event.preventDefault();
                                    toast.info(`Please sign-in to keep enjoying coversation`)
                                    return clerk.openSignIn();
                                }
                            }}>
                            <Button
                                variant={`ghost`}
                                size={`icon`}
                                className="size-8 rounded-full cursor-pointer"
                            >
                                <MoreVerticalIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        {isSignedIn ? (
                            <DropdownMenuContent align="end">
                                {variant === `comment` && (
                                    comment.user.clerkId !== userId && (
                                        <DropdownMenuItem
                                            onClick={() => setIsReplyOpen(true)}
                                            className="cursor-pointer text-xs">
                                            <MessageSquareIcon className="size-3" />
                                            Reply
                                        </DropdownMenuItem>
                                    )
                                )}
                                {comment.user.clerkId === userId && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setIsMessageDeleteModalOpen(true)}
                                        className="cursor-pointer text-xs">
                                        <Trash2Icon className="size-3" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        ) : (
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    className="cursor-pointer text-xs">
                                    <LogIn className="size-3" />
                                    Go log in
                                </DropdownMenuItem>

                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>
                {isReplyOpen && variant === `comment` && (
                    <div className="pl-14 mt-1">
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
                    <div className="pl-10">
                        <Button
                            type="button"
                            size={`sm`}
                            variant={"purple_secondary"}
                            onClick={() => setIsRepliesOpen((current) => !current)}
                            className="cursor-pointer text-xs md:text-sm rounded-full">
                            {isRepliesOpen ?
                                <>
                                    {comment.replyCount === 1 ?
                                        <><ChevronDownIcon /> Hide reply</> :
                                        <><ChevronDownIcon /> Hide replies</>}
                                </> :
                                <>
                                    {comment.replyCount === 1 ?
                                        <><ChevronUpIcon /> View reply</> :
                                        <><ChevronUpIcon /> View replies</>}
                                </>
                            }
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
        </>
    )

}
