import Link from "next/link";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { DocumentUploadForm } from "./document-upload-form";
import { AccountShell } from "../../account-shell";

async function getMyProviderProfile(token) {
  const res = await fetch(apiUrl("/me/provider-profile"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getMyDocuments(token) {
  const res = await fetch(apiUrl("/me/provider-documents"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function BelgelerimPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris?next=/usta/belgeler");
  if (user.role !== "PROVIDER") redirect("/");

  const token = await getSessionToken();
  const [profile, documents] = await Promise.all([getMyProviderProfile(token), getMyDocuments(token)]);

  return (
    <AccountShell
      user={user}
      title="Belgelerim"
      description={'Sertifika/diploma veya sigorta poliçeni yükle, admin incelesin — onaylanınca profilinde gerçek bir "Belgeli Usta" / "Sigortalı Hizmet" rozeti gösterilir.'}
    >

        {!profile ? (
          <Link
            href="/usta/kurulum"
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3.5 text-sm font-medium shadow-sm"
          >
            Önce usta profilini tamamla
            <span className="text-text-muted">›</span>
          </Link>
        ) : (
          <div>
            <DocumentUploadForm initialDocuments={documents} />
          </div>
        )}
    </AccountShell>
  );
}
