// Import the Prisma client instance to interact with the database
import prisma from "@/app/lib/db";

// Import function to get the current server-side user session from Kinde
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Import Next.js's NextResponse utility for server responses
import { NextResponse } from "next/server";

// Import noStore to disable caching for this request
import { unstable_noStore as noStore } from "next/cache";

// Define the GET handler for this route
export async function GET() {
  // Disable caching to ensure fresh data on every request
  noStore();

  // Get the method to fetch user info from the Kinde session
  const { getUser } = getKindeServerSession();
  
  // Fetch the authenticated user's information
  const user = await getUser();

  // If no user is found or user data is incomplete, throw an error
  if (!user || user === null || !user.id) {
    throw new Error("Something went wrong...");
  }

  // Try to find an existing user in the database by ID
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  // If the user does not exist in the database, create a new user record
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        firstName: user.given_name ?? "", // Use given_name if available, otherwise empty string
        lastName: user.family_name ?? "", // Use family_name if available, otherwise empty string
        email: user.email ?? "",           // Use email if available, otherwise empty string
        profileImage:                      // Use picture if available, otherwise generate a placeholder avatar
          user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
      },
    });
  }

  // After ensuring the user exists in the database, redirect to the home page
  return NextResponse.redirect(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/" // Redirect to localhost in development
      : "https://shoe-marshal.vercel.app/" // Redirect to production URL in production
  );
}
