import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { User } from "@prisma/client";

import useLoginModal from "./useLoginModal";

interface IUseFavorite {
  listingId: string;
  currentUser?: User | null;
}

const useFavorite = ({ listingId, currentUser }: IUseFavorite) => {
  const router = useRouter();

  const loginModal = useLoginModal();

  const savedFavorite = useMemo(() => {
    const list = currentUser?.favoriteIds || [];

    return list.includes(listingId);
  }, [currentUser, listingId]);

  // The saved value only catches up once `router.refresh()` has round-tripped
  // through the server component, so the heart follows this override until
  // then. A failed write clears it and the saved value shows through again.
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const hasFavorited = optimisticFavorite ?? savedFavorite;

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!currentUser) {
        return loginModal.onOpen();
      }

      // A second click while the first is in flight would race the two writes
      // against each other and leave the heart showing the loser.
      if (isLoading) {
        return;
      }

      const nextFavorite = !hasFavorited;

      setOptimisticFavorite(nextFavorite);
      setIsLoading(true);

      try {
        if (nextFavorite) {
          await axios.post(`/api/favorites/${listingId}`);
          toast.success("Added to favorites.");
        } else {
          await axios.delete(`/api/favorites/${listingId}`);
          toast.success("Removed from favorites.");
        }

        router.refresh();
      } catch {
        setOptimisticFavorite(null);
        toast.error("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, hasFavorited, isLoading, listingId, loginModal, router]
  );

  return {
    hasFavorited,
    toggleFavorite,
  };
};

export default useFavorite;
