import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteListings() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) return [];

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(currentUser.favoriteIds || [])],
        },
      },
    });

    return favorites;
  } catch (error: any) {
    throw new Error(error);
  }
}
