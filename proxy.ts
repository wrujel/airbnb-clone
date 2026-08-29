import withAuth from "next-auth/middleware";

// Next.js 16 renamed the `middleware` convention to `proxy`.
export const proxy = withAuth;

export const config = {
  matcher: ["/trips", "/reservations", "/properties", "/favorites"],
};
