import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { videosGenerateThumbnailFrontendSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
// import { UpdateOpenThumbnailModal } from "@/lib/redux/features/private/dialog-slice";
// import { useAppDispatch, useAppSelector } from "@/lib/redux/redux-hooks";


interface ThumbnailGenerateModalProps {
    videoId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export const ThumbnailGenerateModal = ({ videoId, isOpen, onOpenChange }: ThumbnailGenerateModalProps) => {
    const form = useForm<z.infer<typeof videosGenerateThumbnailFrontendSchema>>({
        resolver: zodResolver(videosGenerateThumbnailFrontendSchema),
        defaultValues: {
            prompt: ``
        }
    })
    // const utils = trpc.useUtils()

    const generateVideoThumbnail = trpc.videos.generateVideoThumbnail
        .useMutation({
            onSuccess: () => {
                // Handle successful restore, e.g., show a toast notification or invalidate queries
                // utils.studio.getMany.invalidate()
                // utils.studio.getOne.invalidate({ id: videoId })
                toast.success("Background job started", { description: "This may take some time" });
                form.reset()
                onOpenChange(false)
            },
            onError: () => {
                // Handle error, e.g., show a toast notification
                toast.error(`Something went wrong`)
            }
        });

    // Robot holding a red skateboard
    const onSubmit = (values: z.infer<typeof videosGenerateThumbnailFrontendSchema>) => {
        generateVideoThumbnail.mutate({
            id: videoId,
            prompt: values.prompt
        })
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Generate a Thumbnail"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-y-4 px-4 md:px-0 mb-8 md:mb-0">
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        cols={30}
                                        rows={5}
                                        placeholder={`A description of wanted thumbnail`}
                                        className="resize-none h-40"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}

                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={generateVideoThumbnail.isPending}
                            className="cursor-pointer"
                        >
                            Generate
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );
};