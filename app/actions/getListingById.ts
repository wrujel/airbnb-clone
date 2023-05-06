import prisma from "@/app/libs/prismadb";

interface IGetListingById {
  listingId?: string;
}

export default async function getListingById(params: IGetListingById) {
  try {
    const { listingId } = params;

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
      },
    });

    if (!listing) {
      return null;
    }

    return {
      ...listing,
      user: {
        ...listing.user,
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
