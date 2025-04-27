import prisma from "@/app/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fetch recent order data from the database
async function getData() {
  const data = await prisma.order.findMany({
    select: {
      amount: true,
      id: true,
      User: {
        select: {
          firstName: true,
          profileImage: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Order by most recent orders first
    },
    take: 7, // Limit to the latest 7 orders
  });

  return data;
}

export async function RecentSales() {
  // Fetch the recent sales data
  const data = await getData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {/* Map through each order to display the order details */}
        {data.map((item) => (
          <div className="flex items-center gap-4" key={item.id}>
            {/* Display user avatar or initials if no profile image */}
            <Avatar className="hidden sm:flex h-9 w-9">
              <AvatarImage src={item.User?.profileImage} alt="Avatar Image" />
              <AvatarFallback>
                {item.User?.firstName.slice(0, 3)} {/* Show first 3 letters of the name */}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              {/* Display user name and email */}
              <p className="text-sm font-medium">{item.User?.firstName}</p>
              <p className="text-sm text-muted-foreground">
                {item.User?.email}
              </p>
            </div>
            {/* Display the amount spent, formatted to US currency */}
            <p className="ml-auto font-medium">
              +${new Intl.NumberFormat("en-US").format(item.amount / 100)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
