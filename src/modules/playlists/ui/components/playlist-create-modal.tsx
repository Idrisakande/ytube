import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formPlaylistschema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


interface PlaylistCreateModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export const PlaylistCreateModal = ({ isOpen, onOpenChange }: PlaylistCreateModalProps) => {
    const form = useForm<z.infer<typeof formPlaylistschema>>({
        resolver: zodResolver(formPlaylistschema),
        defaultValues: {
            name: ``
        }
    })
    const fieldName = form.watch().name
    const utils = trpc.useUtils()

    const createPlaylist = trpc.playlists.createPlaylist
        .useMutation({
            onSuccess: () => {
                utils.playlists.getManyPlaylists.invalidate()
                form.reset()
                onOpenChange(false)
                toast.success("Playlist created successfully");
            },
            onError: () => {
                toast.error(`Something went wrong`)
            }
        });

    const onSubmit = (values: z.infer<typeof formPlaylistschema>) => {
        createPlaylist.mutate(values)
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Create a playlist"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-y-4 px-4 md:px-0 mb-8 md:mb-0">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={`My favorite videos`}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button
                            variant={"green_variant"}
                            type="submit"
                            disabled={createPlaylist.isPending}
                            className="cursor-pointer"
                        >
                            {createPlaylist.isPending ?
                                <div className="flex items-center justify-center gap-x-1 w-32 truncate line-clamp-1">
                                    <Loader2Icon className="animate-spin text-green-600" />
                                    <span>Creating {fieldName}</span>
                                </div> :
                                `Create ${fieldName}`}
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );
};