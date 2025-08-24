"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { videoFormSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { CopyCheckIcon, CopyIcon, EyeOffIcon, Globe2Icon, ImagePlusIcon, Loader2Icon, LockIcon, MoreVerticalIcon, RotateCcwIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { VIDEO_THUMBNAIL_URL_FALLBACK } from "@/modules/videos/constants";
// import { useAppDispatch } from "@/lib/redux/redux-hooks";
// import { UpdateOpenThumbnailModal } from "@/lib/redux/features/private/dialog-slice";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
// import { UploadButton } from "@/lib/uploadthing";
import { useAppDispatch, useAppSelector } from "@/lib/redux/redux-hooks";
import { UpdateOpenThumbnailGenerateModal, UpdateOpenThumbnailUploadModal } from "@/lib/redux/features/private/dialog-drawer-slice";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { APP_URL } from "@/constant";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoFormSectionProps {
    videoId: string
}

export const VideoFormSection = ({ videoId }: VideoFormSectionProps) => {
    return (
        <Suspense fallback={<VideoFormSectionSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong...</div>}>
                <VideoFormSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
};
// 
const VideoFormSectionSkeleton = () => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-1.5">
                    <Skeleton className="w-32 h-7" />
                    <Skeleton className="w-40 h-3" />
                </div>
                <Skeleton className="w-24 h-8" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="space-y-6 lg:col-span-3">
                    <div className="space-y-1.5">
                        <Skeleton className="w-16 h-5" />
                        <Skeleton className="w-full h-10" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="w-24 h-5" />
                        <Skeleton className="w-full h-44" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-38 h-20" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-full h-10" />
                    </div>
                </div>
                <div className="space-y-10 lg:col-span-2 flex flex-col pt-4">
                    <div className="flex flex-col gap-2 h-fit rounded-xl overflow-hidden bg-[#f9f9f9]/50 pb-6">
                        <Skeleton className="aspect-video" />
                        <div className="gap-y-2 p-4">
                            <div className="space-y-1">
                                <Skeleton className="w-24 h-2" />
                                <Skeleton className="w-full h-4" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="w-24 h-2" />
                                <Skeleton className="w-16 h-4" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="w-24 h-2" />
                                <Skeleton className="w-16 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-full h-10" />
                    </div>
                </div>
            </div>
        </div>
    )
}
// 
const VideoFormSectionSuspense = ({ videoId }: VideoFormSectionProps) => {
    const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
    const [categories] = trpc.categories.getMany.useSuspenseQuery();
    const router = useRouter();
    const utils = trpc.useUtils();
    // Initialize the form with the video data
    const form = useForm<z.infer<typeof videoFormSchema>>({
        resolver: zodResolver(videoFormSchema),
        defaultValues: video
    });
    // call the procedure to update the video
    const updateVideo = trpc.videos.update.useMutation({
        onSuccess: () => {
            // Handle successful update, e.g., show a toast notification or invalidate queries
            utils.studio.getMany.invalidate()
            utils.studio.getOne.invalidate({ id: videoId });
            toast.success("Video updated successfully");
        },
        onError: () => {
            // Handle error, e.g., show a toast notification
            toast.error(`Something went wrong`)
        }
    });
    const onSubmit = async (data: z.infer<typeof videoFormSchema>) => {
        // Handle form submission
        updateVideo.mutate({
            id: videoId,
            ...data
        });
    }
    const fullUrl = `${APP_URL}/videos/${video.id}`;
    const [isCopied, setIsCopied] = useState<boolean>(false)

    const onCopyLink = async () => {
        await navigator.clipboard.writeText(fullUrl);
        setIsCopied(true);
        toast.success("Video link copied to clipboard");
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }
    const removedVideo = trpc.videos.remove.useMutation({
        onSuccess: () => {
            // Handle successful removal, e.g., show a toast notification or invalidate queries
            utils.studio.getMany.invalidate()
            router.push(`/studio`);
            toast.success("Video removed successfully");
        },
        onError: (error) => {
            // Handle error, e.g., show a toast notification
            toast.error(`Something went wrong`)
            console.error("Error removing video:", error);
        }
    });
    const restoreVideoThumbnail = trpc.videos.restoreThumbnail
        .useMutation({
            onSuccess: () => {
                // Handle successful restore, e.g., show a toast notification or invalidate queries
                utils.studio.getMany.invalidate()
                utils.studio.getOne.invalidate({ id: videoId })
                toast.success("Thumbnail restored");
            },
            onError: () => {
                // Handle error, e.g., show a toast notification
                toast.error(`Something went wrong`)
            }
        });
    const generateVideoTitle = trpc.videos.generateVideoTitle
        .useMutation({
            onSuccess: () => {
                // Handle successful restore, e.g., show a toast notification or invalidate queries
                // utils.studio.getMany.invalidate()
                // utils.studio.getOne.invalidate({ id: videoId })
                toast.success("Background job started", { description: "This may take some time" });
            },
            onError: () => {
                // Handle error, e.g., show a toast notification
                toast.error(`Something went wrong`)
            }
        });
    const generateVideoDescription = trpc.videos.generateVideoDescription
        .useMutation({
            onSuccess: () => {
                // Handle successful restore, e.g., show a toast notification or invalidate queries
                // utils.studio.getMany.invalidate()
                // utils.studio.getOne.invalidate({ id: videoId })
                toast.success("Background job started", { description: "This may take some time" });
            },
            onError: () => {
                // Handle error, e.g., show a toast notification
                toast.error(`Something went wrong`)
            }
        });
    const isOpenThumbnailUploadModal = useAppSelector((state) => state.dialog_drawer.openThumbnailUploadModal);
    const isOpenThumbnailGenerateModal = useAppSelector((state) => state.dialog_drawer.openThumbnailGenerateModal);

    const dispatch = useAppDispatch();
    const onOpenChangeThumbnailUpload = (isOpen: boolean) => {
        // Reset the state or perform any cleanup if necessary
        if (!isOpen) {
            dispatch(UpdateOpenThumbnailUploadModal(isOpen));
        }
    }
    const onOpenChangeThumbnailGenerate = (isOpen: boolean) => {
        // Reset the state or perform any cleanup if necessary
        if (!isOpen) {
            dispatch(UpdateOpenThumbnailGenerateModal(isOpen));
        }
    }
    const revalidateVideo = trpc.videos.revaliadte.useMutation({
        onSuccess: () => {
            // Handle successful removal, e.g., show a toast notification or invalidate queries
            utils.studio.getMany.invalidate()
            utils.studio.getOne.invalidate({ id: videoId })
            toast.success("Video revalidated successfully");
        },
        onError: (error) => {
            // Handle error, e.g., show a toast notification
            toast.error(`Something went wrong`)
            console.error("Error removing video:", error);
        }
    });

    return (
        <>
            <ThumbnailUploadModal videoId={videoId} isOpen={isOpenThumbnailUploadModal} onOpenChange={onOpenChangeThumbnailUpload} />
            <ThumbnailGenerateModal videoId={videoId} isOpen={isOpenThumbnailGenerateModal} onOpenChange={onOpenChangeThumbnailGenerate} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-semibold">Video details</h1>
                            <p className="text-xs text-muted-foreground">Manage your video details here.</p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <>
                                <Button type="submit" className="w-fit cursor-pointer md:hidden" disabled={updateVideo.isPending || !form.formState.isDirty}>
                                    Save
                                </Button><Button type="submit" className="w-fit cursor-pointer hidden md:block" disabled={updateVideo.isPending || !form.formState.isDirty}>
                                    Save changes
                                </Button></>

                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size={"icon"}>
                                        <MoreVerticalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => revalidateVideo.mutate({ id: video.id })}>
                                        <RotateCcwIcon className="mr-2 size-4" />
                                        Revalidate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => removedVideo.mutate({ id: video.id })}>
                                        <TrashIcon className="mr-2 size-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="space-y-6 lg:col-span-3">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-x-2">
                                            Title
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={`outline`}
                                                        size={`icon`}
                                                        disabled={generateVideoTitle.isPending || !video.muxTrackId}
                                                        onClick={() => generateVideoTitle.mutate({ id: video.id })}
                                                        className="size-5 [&_svg]:size-3 rounded-full cursor-pointer text-gray-700"

                                                    >
                                                        {generateVideoTitle.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent align="center" className="bg-black/80">
                                                    <p>Generate title with AI</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Add a title to your video"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-x-2">
                                            Description
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={`outline`}
                                                        size={`icon`}
                                                        disabled={generateVideoDescription.isPending || !video.muxTrackId}
                                                        onClick={() => generateVideoDescription.mutate({ id: video.id })}
                                                        className={`size-5 [&_svg]:size-3 rounded-full cursor-pointer text-gray-700`}

                                                    >
                                                        {generateVideoDescription.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent align="center" className="bg-black/80">
                                                    <p>Generate description with AI</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                value={field.value || ""}
                                                placeholder="Add a description to your video"
                                                className="resize-none pr-10 h-44"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/*Thumbnail field */}
                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Thumbnail URL</FormLabel>
                                        <FormControl>
                                            <div className="w-38 h-21 relative rounded-lg overflow-hidden p-0.5 border-dashed border border-muted group">
                                                <Image
                                                    src={video.thumbnailUrl || VIDEO_THUMBNAIL_URL_FALLBACK}
                                                    alt="Thumbnail"
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            size={"icon"}
                                                            className="absolute top-1 right-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 size-7 cursor-pointer">
                                                            <MoreVerticalIcon className="text-white" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" side="right">
                                                        <DropdownMenuItem
                                                            onClick={() => dispatch(UpdateOpenThumbnailUploadModal(true))}
                                                            className="text-[0.8rem] cursor-pointer">
                                                            <ImagePlusIcon className="mr-1 size-4" />
                                                            Change
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={true}
                                                            onClick={() => dispatch(UpdateOpenThumbnailGenerateModal(true))}
                                                            className="text-[0.8rem] cursor-pointer">
                                                            <SparklesIcon className="mr-1 size-4" />
                                                            AI-generated
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => restoreVideoThumbnail.mutate({ id: videoId })}
                                                            className="text-[0.8rem] cursor-pointer">
                                                            <RotateCcwIcon className="mr-1 size-4" />
                                                            Restore
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-6 lg:col-span-2 flex flex-col pt-4">
                            {/* video player */}
                            <div className="flex flex-col gap-2 h-fit rounded-xl overflow-hidden bg-[#f9f9f9]">
                                <div className="aspect-video overflow-hidden relative">
                                    <VideoPlayer
                                        playbackId={video.muxPlaybackId}
                                        thumbnailUrl={video.thumbnailUrl}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-2 p-4">
                                    <div className="flex justify-between items-center gap-x-2">
                                        <div className="flex flex-col">
                                            <p className="text-xs text-muted-foreground">
                                                Video link
                                            </p>
                                            <div className="flex items-center gap-x-2">
                                                <Link prefetch href={`/videos/${video.id}`}>
                                                    <p className="text-xs text-blue-500 hover:underline line-clamp-1">
                                                        {fullUrl}
                                                    </p>
                                                </Link>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={onCopyLink}
                                                    className="shrink-0 cursor-pointer"
                                                    disabled={isCopied}
                                                >
                                                    {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center" >
                                        <div className="flex flex-col gap-y-1 w-full">
                                            <p className="text-xs text-muted-foreground">
                                                Video status
                                            </p>
                                            <p className="text-xs font-semibold">
                                                {snakeCaseToTitleCase(video.muxStatus || `preparing`)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center" >
                                        <div className="flex flex-col gap-y-1 w-full">
                                            <p className="text-xs text-muted-foreground">
                                                Subtitle status
                                            </p>
                                            <p className="text-xs font-semibold">
                                                {snakeCaseToTitleCase(video.muxTrackStatus || `no_subtitles`)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* visibility select */}
                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || "private"}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="private" className="flex items-center">
                                                    <LockIcon className="size-4 mr-2" />
                                                    Private
                                                </SelectItem>
                                                <SelectItem value="public" className="flex items-center">
                                                    <Globe2Icon className="size-4 mr-2" />
                                                    Public
                                                </SelectItem>
                                                <SelectItem value="unlisted" className="flex items-center">
                                                    <EyeOffIcon className="size-4 mr-2" />
                                                    Unlisted
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </form >
            </Form >
        </>
    )
}
