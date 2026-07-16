"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <div className="text-lg font-extrabold">Teklifler Cepte — Panel</div>
      <div className="text-xl font-bold">Bir şeyler ters gitti</div>
      <p className="max-w-sm text-sm text-text-muted">Beklenmedik bir hata oluştu.</p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="text-sm font-semibold text-primary">
          Tekrar Dene
        </button>
        <Link href="/" className="text-sm font-semibold text-primary">
          Panele Dön
        </Link>
      </div>
    </div>
  );
}
