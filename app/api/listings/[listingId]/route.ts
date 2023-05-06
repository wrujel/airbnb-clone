import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";

interface IListingParams {
  listingId?: string;
}

export async function DELETE(request: Request, params: IListingParams) {
  const currenUser = await getCurrentUser();

  if (!currenUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      userId: currenUser.id,
    },
  });

  return NextResponse.json(listing);
}
