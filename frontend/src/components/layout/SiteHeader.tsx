import { Navbar } from "./Navbar";
import { TopBar } from "./TopBar";

/** Public site header — top bar scrolls away; main nav is sticky via `.site-nav`. */
export function SiteHeader() {
  return (
    <>
      <TopBar />
      <Navbar />
    </>
  );
}