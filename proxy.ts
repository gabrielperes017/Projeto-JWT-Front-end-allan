import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  // cookie "session" é gravado pelo front no login (os tokens ficam no localStorage)
  const session = req.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(
      new URL('/', req.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
