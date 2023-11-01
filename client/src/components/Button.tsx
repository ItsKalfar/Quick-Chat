import { forwardRef, ButtonHTMLAttributes, FC } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "rounded inline-flex flex-shrink-0 justify-center items-center text-center shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gray-700 text-white font-semibold",
        outline: "bg-transparent text-gray-900",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded px-3",
        lg: "h-11 rounded px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// To be able to pass all the propertise a button tag has in html: React.ButtonHTMLAttributes<HTMLButtonElement>
// To be able to pass all the button variants we createed above :  VariantProps<typeof buttonVariants>
interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// Use forwardRef hook to be able to use ref on button

export const Button: FC<ButtonProps> = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, size, variant, ...props }, ref) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
      ref={ref}
    />
  );
});
