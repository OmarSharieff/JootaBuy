"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { bannerSchema, productSchema } from "./lib/zodSchemas";
import prisma from "./lib/db";
import { redis } from "./lib/redis";
import { Cart } from "./lib/interfaces";
import { revalidatePath } from "next/cache";
import { stripe } from "./lib/stripe";
import Stripe from "stripe";

// Function to create a new product, only accessible by a specific user
export async function createProduct(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure only a specific user has access to this functionality
  if (!user || user.email !== "omarsharief642002@gmail.com") {
    return redirect("/");
  }

  // Validate and parse the form data using Zod schema
  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  // If validation fails, return the errors
  if (submission.status !== "success") {
    return submission.reply();
  }

  // Flatten image URLs from a comma-separated string
  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  // Create a new product entry in the database
  await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: flattenUrls,
      category: submission.value.category,
      isFeatured: submission.value.isFeatured === true ? true : false,
    },
  });

  // Redirect to product dashboard after successful product creation
  redirect("/dashboard/products");
}

// Function to edit an existing product, accessible by a specific user
export async function editProduct(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure only a specific user has access to this functionality
  if (!user || user.email !== "jan@alenix.de") {
    return redirect("/");
  }

  // Validate and parse the form data using Zod schema
  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  // If validation fails, return the errors
  if (submission.status !== "success") {
    return submission.reply();
  }

  // Flatten image URLs from a comma-separated string
  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  // Retrieve the product ID and update the product in the database
  const productId = formData.get("productId") as string;
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      category: submission.value.category,
      price: submission.value.price,
      isFeatured: submission.value.isFeatured === true ? true : false,
      status: submission.value.status,
      images: flattenUrls,
    },
  });

  // Redirect to product dashboard after successful product update
  redirect("/dashboard/products");
}

// Function to delete a product, accessible by a specific user
export async function deleteProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure only a specific user has access to this functionality
  if (!user || user.email !== "jan@alenix.de") {
    return redirect("/");
  }

  // Delete the product from the database
  await prisma.product.delete({
    where: {
      id: formData.get("productId") as string,
    },
  });

  // Redirect to product dashboard after successful product deletion
  redirect("/dashboard/products");
}

// Function to create a new banner, accessible by a specific user
export async function createBanner(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure only a specific user has access to this functionality
  if (!user || user.email !== "jan@alenix.de") {
    return redirect("/");
  }

  // Validate and parse the form data using Zod schema
  const submission = parseWithZod(formData, {
    schema: bannerSchema,
  });

  // If validation fails, return the errors
  if (submission.status !== "success") {
    return submission.reply();
  }

  // Create a new banner entry in the database
  await prisma.banner.create({
    data: {
      title: submission.value.title,
      imageString: submission.value.imageString,
    },
  });

  // Redirect to banner dashboard after successful banner creation
  redirect("/dashboard/banner");
}

// Function to delete a banner, accessible by a specific user
export async function deleteBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure only a specific user has access to this functionality
  if (!user || user.email !== "jan@alenix.de") {
    return redirect("/");
  }

  // Delete the banner from the database
  await prisma.banner.delete({
    where: {
      id: formData.get("bannerId") as string,
    },
  });

  // Redirect to banner dashboard after successful banner deletion
  redirect("/dashboard/banner");
}

// Function to add an item to the user's shopping cart
export async function addItem(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure user is logged in before proceeding
  if (!user) {
    return redirect("/");
  }

  // Get the current user's cart from Redis
  let cart: Cart | null = await redis.get(`cart-${user.id}`);

  // Fetch the product details from the database
  const selectedProduct = await prisma.product.findUnique({
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
    },
    where: {
      id: productId,
    },
  });

  // Handle case where product is not found
  if (!selectedProduct) {
    throw new Error("No product with this id");
  }
  
  // If no cart exists, initialize a new one
  let myCart = {} as Cart;

  if (!cart || !cart.items) {
    myCart = {
      userId: user.id,
      items: [
        {
          price: selectedProduct.price,
          id: selectedProduct.id,
          imageString: selectedProduct.images[0],
          name: selectedProduct.name,
          quantity: 1,
        },
      ],
    };
  } else {
    let itemFound = false;

    // If the product is already in the cart, increment its quantity
    myCart.items = cart.items.map((item) => {
      if (item.id === productId) {
        itemFound = true;
        item.quantity += 1;
      }

      return item;
    });

    // If the product isn't in the cart, add it as a new item
    if (!itemFound) {
      myCart.items.push({
        id: selectedProduct.id,
        imageString: selectedProduct.images[0],
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
      });
    }
  }

  // Save the updated cart back to Redis
  await redis.set(`cart-${user.id}`, myCart);

  // Revalidate the homepage to reflect the updated cart
  revalidatePath("/", "layout");
}

// Function to remove an item from the user's shopping cart
export async function delItem(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure user is logged in before proceeding
  if (!user) {
    return redirect("/");
  }

  // Get the product ID to delete
  const productId = formData.get("productId");

  // Get the current user's cart from Redis
  let cart: Cart | null = await redis.get(`cart-${user.id}`);

  if (cart && cart.items) {
    // Remove the item from the cart
    const updateCart: Cart = {
      userId: user.id,
      items: cart.items.filter((item) => item.id !== productId),
    };

    // Save the updated cart back to Redis
    await redis.set(`cart-${user.id}`, updateCart);
  }

  // Revalidate the cart page to reflect the updated cart
  revalidatePath("/bag");
}

// Function to initiate the checkout process
export async function checkOut() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure user is logged in before proceeding
  if (!user) {
    return redirect("/");
  }

  // Get the current user's cart from Redis
  let cart: Cart | null = await redis.get(`cart-${user.id}`);

  if (cart && cart.items) {
    // Map the cart items to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => ({
        price_data: {
          currency: "usd",
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            images: [item.imageString],
          },
        },
        quantity: item.quantity,
      }));

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/payment/success"
          : "https://shoe-marshal.vercel.app/payment/success",
      cancel_url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/payment/cancel"
          : "https://shoe-marshal.vercel.app/payment/cancel",
      metadata: {
        userId: user.id,
      },
    });

    // Redirect to the Stripe Checkout session URL
    return redirect(session.url as string);
  }
}
