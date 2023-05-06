import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getReservations from "../actions/getReservations";
import ReservationsClient from "./ReservationsClient";

const ReservationsPage = async () => {
  const currentUser = await getCurrentUser();
  const reservations = await getReservations({
    authorId: currentUser?.id,
  });

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="You must be signed in"
          subtitle="You must be signed in to view this page"
        />
      </ClientOnly>
    );
  }

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No reservations found"
          subtitle="You have no reservations scheduled"
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ReservationsClient
        reservations={reservations}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default ReservationsPage;
