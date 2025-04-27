import prisma from "@/app/lib/db"; // Prisma client for database operations
import { redis } from "@/app/lib/redis"; // Redis client for caching
import { stripe } from "@/app/lib/stripe"; // Stripe instance for handling webhooks
import { headers } from "next/headers"; // Helper to access request headers

export async function POST(req: Request) {
  const body = await req.text(); // Get raw request body (needed for Stripe signature verification)

  const signature = headers().get("Stripe-Signature") as string; // Get Stripe signature from headers

  let event;

  try {
    // Verify and construct the Stripe event
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_SECRET_WEBHOOK as string
    );
  } catch (error: unknown) {
    // Return error if verification fails
    return new Response("Webhook Error", { status: 400 });
  }

  // Handle specific Stripe event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      // Save the completed order details to the database
      await prisma.order.create({
        data: {
          amount: session.amount_total as number,
          status: session.status as string,
          userId: session.metadata?.userId,
        },
      });

      // Clear the user's cart from Redis after successful checkout
      await redis.del(`cart-${session.metadata?.userId}`);
      break;
    }
    default: {
      // Log any unhandled event types for debugging
      console.log("unhandled event");
    }
  }

  return new Response(null, { status: 200 }); // Acknowledge receipt of the event
}
