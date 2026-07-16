import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <div className="text-6xl font-extrabold text-primary">404</div>
      <div className="text-xl font-bold">Bu sayfa bulunamadı</div>
      <Link href="/" className="mt-2 text-sm font-semibold text-primary">
        Panele dön
      </Link>
    </div>
  );
}
