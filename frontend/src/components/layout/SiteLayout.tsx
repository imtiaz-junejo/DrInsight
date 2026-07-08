import { Footer } from "./Footer";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export { SiteHeader } from "./SiteHeader";
export { TopBar } from "./TopBar";
export { Navbar } from "./Navbar";
export { Footer } from "./Footer";
