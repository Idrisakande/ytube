import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { commentSchema } from "@/db/schema"
import { trpc } from "@/trpc/client"
import { useClerk, useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
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
                className="flex gap-4 group">
                <UserAvatar
                    size={`lg`}
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
                                        className="bg-transparent min-h-0 resize-none overflow-hidden"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        {onCancel && (
                            <Button variant={"ghost"} type="button" onClick={handelCancel} className="cursor-pointer rounded-full">
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size={`sm`}
                            disabled={createComments.isPending}
                            className="cursor-pointer rounded-full"
                        >
                            {variant === `reply` ? "Reply" : "Comment"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}