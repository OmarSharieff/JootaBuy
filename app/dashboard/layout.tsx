import { ReactNode } from "react";
import { DashboardNavigation } from "../componentsUI/DashboardNavigation";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-white">
        <nav className="hidden font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <DashboardNavigation />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <MenuIcon className="h-5 w-5"/>
            </Button>
          </SheetTrigger>
        </Sheet>
      </header>
    </div>
  );
}
