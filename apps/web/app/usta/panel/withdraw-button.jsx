"use client";

import { useRouter } from "next/navigation";
import { Button } from "@tekliflercepte/ui";

export function WithdrawButton({ offerId }) {
  const router = useRouter();

  const withdraw = async () => {
    const res = await fetch(`/api/offers/${offerId}/withdraw`, { method: "POST" });
    if (res.status === 401) {
      router.push("/giris?next=/usta/panel");
      return;
    }
    router.refresh();
  };

  return (
    <Button variant="danger" size="sm" onClick={withdraw}>
      Geri Çek
    </Button>
  );
}
