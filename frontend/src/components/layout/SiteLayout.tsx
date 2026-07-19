import { SiteChrome } from "./SiteChrome";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}

export { SiteHeader } from "./SiteHeader";
export { TopBar } from "./TopBar";
export { Navbar } from "./Navbar";
export { Footer } from "./Footer";
