"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@tekliflercepte/ui";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <div className="text-lg font-extrabold">Teklifler Cepte</div>
      <div className="text-xl font-bold">Bir şeyler ters gitti</div>
      <p className="max-w-sm text-sm text-text-muted">
        Beklenmedik bir hata oluştu. Tekrar deneyebilir ya da ana sayfaya dönebilirsin.
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="secondary" size="md" onClick={reset}>
          Tekrar Dene
        </Button>
        <Link href="/">
          <Button size="md">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  );
}
