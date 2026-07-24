import { Hero } from "@/components/sections/hero";
import { Drops } from "@/components/sections/drops";
import { About } from "@/components/sections/about";
import { Wholesale } from "@/components/sections/wholesale";
import { FindUs } from "@/components/sections/find-us";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Drops />
      <About />
      <Wholesale />
      <FindUs />
    </>
  );
}