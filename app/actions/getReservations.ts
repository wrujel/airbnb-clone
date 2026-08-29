import { Prisma } from "@prisma/client";

import prisma from "@/app/libs/prismadb";

interface Reservation {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: Reservation) {
  const { listingId, userId, authorId } = params;

  const query: Prisma.ReservationWhereInput = {};

  if (listingId) {
    query.listingId = listingId;
  }

  if (userId) {
    query.userId = userId;
  }

  if (authorId) {
    query.listing = { userId: authorId };
  }

  const reservations = await prisma.reservation.findMany({
    where: query,
    include: {
      listing: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return reservations.map((reservation) => ({
    ...reservation,
    listing: {
      ...reservation.listing,
    },
  }));
}
