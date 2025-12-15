// src/components/header.tsx
import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "@/components/toggle"

export default function Header() {
  return (
    <header className="border-b border-blue-900/20 px-6 py-4 bg-white dark:bg-black text-black dark:text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href='/' className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/mask.png" 
                  alt="Devil's Plan Mask"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold">The Devil&apos;s Plan</h1>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 ml-auto pr-4">
          {/* update this link later */}
          <Link href="/about" className="bg-white dark:bg-black text-black dark:text-white hover:text-red-400 transition"> 
            About
          </Link>
        </nav>
        {/* TODO: FIX LIGHT DARK MODE */}
        {/* the white is very 刺眼 remind me to fix this and apply to all pages such that it works */}
        {/* <ThemeToggle /> */}
        {/* im thinking if i n</div>eed a sign in */}
        {/* <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-950">
          Sign In 
        </Button> */}
      </div>
    </header>
  )
}