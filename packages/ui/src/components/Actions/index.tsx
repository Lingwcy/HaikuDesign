
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { ActionsProps } from "./interface";

const actionsVariants = cva("flex items-center gap-2", {
    variants: {
        variant: {
            borderless: "",
            filled: "bg-gray-100 p-2 rounded",
            outlined: "border border-gray-300 p-2 rounded",
        },
    },
    defaultVariants: {
        variant: "borderless",
    },
});


const ForwardActions = ({
    items,
    onClick,
    variant,
    classNames,
    ...props
}: ActionsProps) => {
    return (
        <div className={actionsVariants({ variant, className: classNames })} {...props}>
            {items.map((item) => (
                <div
                    key={item.key}
                    className="flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={(e) => {
                        onClick?.({
                            item,
                            key: item.key || "",
                            keyPath: [],
                            domEvent: e,
                        });
                    }
                    }
                >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                </div>
            ))}
        </div>
    )
}


