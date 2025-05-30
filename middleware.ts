import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Don't redirect the root path anymore, let the splash screen handle it
  // if (request.nextUrl.pathname === "/") {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [],
}
