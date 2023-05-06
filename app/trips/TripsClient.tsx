"use client";

import { Listing, Reservation, User } from "@prisma/client";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ListingCard from "../components/listings/ListingCard";

interface TripsClientProps {
  currentUser?: User | null;
  reservations: (Reservation & {
    listing: Listing;
  })[];
}

const TripsClient: React.FC<TripsClientProps> = ({
  currentUser,
  reservations,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

  const onCancel = useCallback(
    async (id: string) => {
      setDeletingId(id);

      axios
        .delete(`/api/reservations/${id}`)
        .then(() => {
          toast.success("Reservation cancelled successfully");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message || "Something went wrong");
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  return (
    <Container>
      <Heading title="Trips" subtitle="Your upcoming trips" />
      <div
        className="
          mt-10
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
      >
        {reservations.map((reservation) => (
          <ListingCard
            key={reservation.id}
            data={reservation.listing}
            reservation={reservation}
            actionId={reservation.id}
            onAction={onCancel}
            disabled={deletingId === reservation.id}
            actionLabel="Cancel Reservation"
            currentUser={currentUser}
          />
        ))}
      </div>
    </Container>
  );
};

export default TripsClient;
