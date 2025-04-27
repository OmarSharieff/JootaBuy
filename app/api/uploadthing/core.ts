import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"; // Import Kinde session handler
import { createUploadthing, type FileRouter } from "uploadthing/next"; // Import UploadThing for file uploads
import { UploadThingError } from "uploadthing/server"; // Custom error for UploadThing

const f = createUploadthing(); // Initialize UploadThing instance

// Define the FileRouter for managing file uploads
export const ourFileRouter = {
  // Route for uploading multiple images (up to 10)
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      // Allow upload only if the user is authorized
      if (!user || user.email !== "omarsharief642002@gmail.com")
        throw new UploadThingError("Unauthorized");

      // Return metadata to be available during upload completion
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Runs after file upload is completed
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // Data returned here is sent to the client in `onClientUploadComplete`
      return { uploadedBy: metadata.userId };
    }),

  // Route for uploading a single banner image
  bannerImageRoute: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      // Restrict upload to a specific authorized user
      if (!user || user.email !== "jan@alenix.de")
        throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter; // Type-safety check for FileRouter

export type OurFileRouter = typeof ourFileRouter; // Export router type for use elsewhere
