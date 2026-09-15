import {nextResponse} from "next/server";

export async function proxy(request) {
    const {pathname} = request.nextUrl;
     
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
        return nextResponse.redirect(new URL("/login", request.url));
    }

    return nextResponse.next();     
}

export const config = {
    matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"]
}