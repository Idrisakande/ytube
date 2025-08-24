import { useEffect, useState, useRef } from "react";


export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
    const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // // Check if the targetRef is set
        // if (!targetRef.current) {
        //     return;
        // }
        // // Ensure the IntersectionObserver is supported
        // if (!("IntersectionObserver" in window)) {
        //     console.warn("IntersectionObserver is not supported in this browser.");
        //     return;
        // }
        // Create the IntersectionObserver instance
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            options
        );
        // Observe the target element
        if (targetRef.current) {
            observer.observe(targetRef.current);
        }
        // Optionally, you can return a cleanup function to stop observing
        // return () => {
        //     if (targetRef.current) {
        //         observer.unobserve(targetRef.current);
        //     }
        // };
        // Cleanup function to disconnect the observer
        return () => observer.disconnect();
    }, [targetRef, options]);
    // }, [targetRef, options]);

    return { isIntersecting, targetRef };
};
