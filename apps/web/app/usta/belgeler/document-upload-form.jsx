"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Badge, Button, Input } from "@tekliflercepte/ui";

const TYPE_LABEL = { CERTIFICATE: "Sertifika / Diploma", INSURANCE: "Sigorta Poliçesi" };
const STATUS_TONE = { PENDING: "warning", APPROVED: "success", REJECTED: "neutral" };
const STATUS_LABEL = { PENDING: "İnceleniyor", APPROVED: "Onaylandı", REJECTED: "Reddedildi" };

export function DocumentUploadForm({ initialDocuments }) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [type, setType] = useState("CERTIFICATE");
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Önce bir dosya seç");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/uploads", { method: "POST", body: formData });
      if (uploadRes.status === 401) {
        router.push("/giris?next=/usta/belgeler");
        return;
      }
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error ?? "Dosya yüklenemedi");
        return;
      }

      const res = await fetch("/api/provider-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, fileUrl: uploadData.url, label: label || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Belge kaydedilemedi");
        return;
      }
      setDocuments((prev) => [data, ...prev]);
      setLabel("");
      fileInputRef.current.value = "";
      toast.success("Belgen gönderildi, admin incelemesi bekleniyor.");
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`/api/provider-documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Silinemedi");
        return;
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Bir bağlantı sorunu oluştu, lütfen tekrar dene.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold">Belge Türü</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3.5 py-2.5 text-sm"
          >
            <option value="CERTIFICATE">Sertifika / Diploma</option>
            <option value="INSURANCE">Sigorta Poliçesi</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Açıklama (opsiyonel)</label>
          <Input
            maxLength={100}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Örn: Elektrik Ustası Sertifikası"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Dosya (JPEG, PNG, WebP veya PDF)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="block w-full text-sm"
          />
        </div>
        <Button type="submit" disabled={uploading} className="self-start">
          {uploading ? "Gönderiliyor..." : "Belgeyi Gönder"}
        </Button>
      </form>

      {documents.length > 0 && (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm"
            >
              <div>
                <div className="font-medium">{doc.label || TYPE_LABEL[doc.type]}</div>
                <div className="text-xs text-text-muted">{TYPE_LABEL[doc.type]}</div>
                {doc.status === "REJECTED" && doc.reviewNote && (
                  <div className="mt-1 text-xs text-danger">Sebep: {doc.reviewNote}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
                {doc.status === "PENDING" && (
                  <button onClick={() => remove(doc.id)} className="text-xs font-semibold text-danger">
                    Geri Çek
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
