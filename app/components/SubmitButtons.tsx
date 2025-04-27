"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { useFormStatus } from "react-dom";

// Type for button props
interface buttonProps {
  text: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

// SubmitButton component that displays a loading spinner when the form is pending submission
export function SubmitButton({ text, variant }: buttonProps) {
  const { pending } = useFormStatus(); // Track if the form is in pending state
  return (
    <>
      {pending ? (
        // Show loading spinner and 'Please Wait' text when form is pending
        <Button disabled variant={variant}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please Wait
        </Button>
      ) : (
        // Display the submit button when the form is not pending
        <Button variant={variant} type="submit">
          {text}
        </Button>
      )}
    </>
  );
}

// ShoppingBagButton component with a loading spinner while waiting for action
export function ShoppingBagButton() {
  const { pending } = useFormStatus(); // Track form submission status

  return (
    <>
      {pending ? (
        // Show loading spinner when pending
        <Button disabled size="lg" className="w-full mt-5">
          <Loader2 className="mr-4 h-5 w-5 animate-spin" /> Please Wait
        </Button>
      ) : (
        // Display "Add to Cart" button when form is not pending
        <Button size="lg" className="w-full mt-5" type="submit">
          <ShoppingBag className="mr-4 h-5 w-5" /> Add to Cart
        </Button>
      )}
    </>
  );
}

// DeleteItem button to handle item deletion with a loading state
export function DeleteItem() {
  const { pending } = useFormStatus(); // Track if the form is in pending state

  return (
    <>
      {pending ? (
        // Show "Removing..." text when pending
        <button disabled className="font-medium text-primary text-end">
          Removing...
        </button>
      ) : (
        // Show "Delete" button when not pending
        <button type="submit" className="font-medium text-primary text-end">
          Delete
        </button>
      )}
    </>
  );
}

// CheckoutButton component with a loading spinner while awaiting checkout action
export function ChceckoutButton() {
  const { pending } = useFormStatus(); // Track form submission status

  return (
    <>
      {pending ? (
        // Show loading spinner when pending
        <Button disabled size="lg" className="w-full mt-5">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Please Wait
        </Button>
      ) : (
        // Display "Checkout" button when form is not pending
        <Button type="submit" size="lg" className="w-full mt-5">
          Checkout
        </Button>
      )}
    </>
  );
}
