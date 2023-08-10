import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function generateRandomNumber(): string {
    const length = 16
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString();
  }

export function middleware(request: NextRequest) {
    // Setting cookies on the response using the `ResponseCookies` API
    const response = NextResponse.next()
    if (!request.cookies.has('cartid')) {
        response.cookies.set('cartid', generateRandomNumber())
    }

    return response
}