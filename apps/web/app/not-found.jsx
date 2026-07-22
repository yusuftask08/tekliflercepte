import Link from "next/link";
import { Button } from "@tekliflercepte/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-6xl font-extrabold text-primary">404</div>
        <div className="text-xl font-bold">Bu sayfa bulunamadı</div>
        <p className="max-w-sm text-sm text-text-muted">
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
        <Link href="/" className="mt-3">
          <Button size="md">Ana sayfaya dön</Button>
        </Link>
      </div>
    </div>
  );
}
