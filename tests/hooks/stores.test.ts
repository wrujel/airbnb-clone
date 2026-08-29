import { afterEach, describe, expect, it } from "vitest";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useRentModal from "@/app/hooks/useRentModal";
import useSearchModal from "@/app/hooks/useSearchModal";

const stores = {
  login: useLoginModal,
  register: useRegisterModal,
  rent: useRentModal,
  search: useSearchModal,
};

afterEach(() => {
  Object.values(stores).forEach((store) => store.setState({ isOpen: false }));
});

describe.each(Object.entries(stores))("%s modal store", (_name, useStore) => {
  it("starts closed", () => {
    expect(useStore.getState().isOpen).toBe(false);
  });

  it("opens and closes", () => {
    useStore.getState().onOpen();
    expect(useStore.getState().isOpen).toBe(true);

    useStore.getState().onClose();
    expect(useStore.getState().isOpen).toBe(false);
  });
});
