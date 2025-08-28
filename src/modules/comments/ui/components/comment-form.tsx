import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { commentSchema } from "@/db/schema"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"
import { useClerk, useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z, ZodError } from "zod"

interface CommentFormProps {
    videoId: string
    parentId?: string
    onSuccess?: () => void
    onCancel?: () => void
    variant?: `reply` | `comment`
}

export const CommentForm = ({ videoId, onSuccess, onCancel, parentId, variant = `comment` }: CommentFormProps) => {
    const { user } = useUser()
    const clerk = useClerk()
    const utils = trpc.useUtils()
    const createComments = trpc.comments.create.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({ videoId })
            utils.comments.getMany.invalidate({ videoId, parentId })
            form.reset()
            toast.success(`Comment added successfully`)
            onSuccess?.()
        },
        onError: (error) => {
            if (error.data?.code === `UNAUTHORIZED`) {
                clerk.openSignIn()
                toast.error(`Please sign in`)
                return
            }
            if (error.message === `Type comment or reply a comment`) {
                toast.error(error.message)
                return
            }
            if (error instanceof ZodError) {
                toast.error(error.message)
                return
            }
            toast.error(`Something went wrong`)
        }
    })

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            videoId,
            value: ``,
            parentId,
        }
    })
    const handleSubmit = (values: z.infer<typeof commentSchema>) => {
        createComments.mutate(values)
    }
    const handelCancel = () => {
        form.reset()
        onCancel?.()
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex gap-3 group">
                <UserAvatar
                    size={variant === `comment` ? `default` : `sm`}
                    imageUrl={user?.imageUrl || `/user-placeholder.svg`}
                    name={user?.username || `User`}
                />
                <div className="flex-1">
                    <FormField
                        name={`value`}
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder={variant === `reply` ? "Reply to this comment..." : "Add a comment..."}
                                        className={cn(`bg-transparent min-h-0 resize-none overflow-hidden 
                                            text-sm focus-visible:ring-purple-400 placeholder:text-sm`,
                                            variant === `reply` && `text-xs py-1.5 placeholder:text-xs md:placeholder:text-sm`,
                                        )}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        {onCancel && (
                            <Button
                                size={variant === `reply` ? `sm` : `default`}
                                variant={"ghost"}
                                type="button"
                                onClick={handelCancel}
                                className={cn(`cursor-pointer rounded-full`,
                                    variant === `reply` && `text-xs`,
                                )}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size={`sm`}
                            variant={variant === `reply` ? `green_ghost` : `green`}
                            disabled={createComments.isPending || !form.formState.isDirty}
                            className={cn(`rounded-full cursor-pointer`,
                                createComments.isPending && `w-22 flex items-center justify-center`,
                                variant === `reply` && `text-xs w-18`,
                            )}
                        >
                            {createComments.isPending ?
                                <Loader2Icon className={cn(`size-5 animate-spin`,
                                    variant === `reply` && `size-4`,
                                )} /> :
                                variant === `reply` ? "Reply" : "Comment"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}