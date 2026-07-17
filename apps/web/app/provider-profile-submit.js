import { toast } from "react-toastify";

// Shared save flow for provider-profile-fields.jsx consumers (onboarding
// wizard + /profil edit form) — PUTs the profile, handles the 401/error
// cases the same way in both places, and leaves post-success behavior
// (toast copy, redirect vs. stay-on-page) to the caller.
export async function submitProviderProfile(payload, { router, loginRedirectPath }) {
  try {
    const res = await fetch("/api/provider-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      router.push(`/giris?next=${loginRedirectPath}`);
      return { ok: false };
    }
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Profil kaydedilemedi, lütfen tekrar dene.");
      return { ok: false, error: data.error };
    }
    return { ok: true, data };
  } catch {
    toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    return { ok: false };
  }
}

// Only relevant to the onboarding wizard's own face-photo step — the
// consolidated /profil edit form doesn't touch avatarUrl (AccountForm owns it).
export async function submitAvatarUrl(avatarUrl) {
  return fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatarUrl }),
  });
}
