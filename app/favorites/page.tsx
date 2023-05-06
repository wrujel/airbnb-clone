import getCurrentUser from "../actions/getCurrentUser";
import getFavoriteListings from "../actions/getFavoriteListings";
import ClientOnly from "../components/ClientOnly";
import EmptyState from "../components/EmptyState";
import FavoritesClient from "./FavoritesClient";

const ListingsPage = async () => {
  const listings = await getFavoriteListings();
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No Favorites found"
          subtitle="Try searching for a listing or adding a new one."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <FavoritesClient listings={listings} currentUser={currentUser} />
    </ClientOnly>
  );
};

export default ListingsPage;
