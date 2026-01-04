
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Icon } from "@iconify/react";
import React from "react";

const avatarVariants = cva(
    "inline-flex items-center justify-center overflow-hidden align-middle text-primary-foreground",
    {
        variants: {
            variant: {
                default: "bg-muted-foreground ",
                ghost: "text-white",
                primary: "bg-primary-900 text-primary-foreground",
                info: "bg-info  text-info-foreground",
                success: "bg-success text-success-foreground",
                warning: "bg-warning text-warning-foreground",
                danger: "bg-danger text-danger-foreground",

            },
            shape: {
                rounded: "rounded-full",
                square: "rounded-md",
            },
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-12 w-12",
            }
        },
        defaultVariants: {
            shape: "rounded",
            size: "md",
            variant: "default",
        }
    }
);

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
    alt?: string;
    icon?: React.ReactNode | string;
    url?: string;
}

export default function Avatar({
    alt,
    icon,
    shape,
    size,
    variant,
    className,
    url,
    ...props
}: AvatarProps) {
    return (
        <div className={cn(avatarVariants({ shape, size, variant }), className)} {...props}>
            {icon ? (
                typeof icon === "string" ? (
                    <Icon icon={icon} className="w-[80%] h-[80%]" />
                ) : (
                    icon
                )
            ) : (
                url ? (
                    <img src={url} alt={alt} className="w-full h-full object-cover" />
                ) : (

                    <span className="text-sm font-medium">{alt ? alt.charAt(0).toUpperCase() : "?"}</span>)
            )}
        </div>
    )
}
