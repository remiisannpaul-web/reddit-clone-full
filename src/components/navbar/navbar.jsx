import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-primary">Sociomodus</span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/80 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}