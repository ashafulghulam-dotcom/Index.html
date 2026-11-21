import React, { useMemo, useState } from 'react';
import {
  Clock,
  Edit3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  UserCheck,
} from 'lucide-react';
import {
  buildKuaGoogleMapsUrl,
  DESA_PER_KUA_JEPARA,
  KuaDirectoryEntry,
} from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { formatIndonesianDate } from '../utils/bimwinLogic';
import { normalizeWhatsAppNumber } from '../utils/smartReminder';
import { ModalDialog } from './UiPrimitives';

interface KuaFormState {
  alamat: string;
  telp: string;
  whatsapp: string;
  email: string;
  kepalaKua: string;
  jamLayanan: string;
  mapsUrl: string;
  catatan: string;
}

export const KuaDirectoryManager: React.FC = () => {
  const { data, updateKuaDirectoryEntry, resetKuaDirectoryEntry, requestConfirm } = useBimwin();
  const [search, setSearch] = useState('');
  const [editingEntry, setEditingEntry] = useState<KuaDirectoryEntry | null>(null);
  const [form, setForm] = useState<KuaFormState>({
    alamat: '',
    telp: '',
    whatsapp: '',
    email: '',
    kepalaKua: '',
    jamLayanan: '',
    mapsUrl: '',
    catatan: '',
  });
  const [formError, setFormError] = useState('');

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.kuaDirectory;
    return data.kuaDirectory.filter(
      (item) =>
        item.kua.toLowerCase().includes(q) ||
        item.alamat.toLowerCase().includes(q) ||
        item.telp.toLowerCase().includes(q) ||
        (item.whatsapp || '').toLowerCase().includes(q) ||
        (item.kepalaKua || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q)
    );
  }, [data.kuaDirectory, search]);

  const openEditor = (entry: KuaDirectoryEntry) => {
    setEditingEntry(entry);
    setFormError('');
    setForm({
      alamat: entry.alamat || '',
      telp: entry.telp || '',
      whatsapp: entry.whatsapp || '',
      email: entry.email || '',
      kepalaKua: entry.kepalaKua || '',
      jamLayanan: entry.jamLayanan || '',
      mapsUrl: entry.mapsUrl || '',
      catatan: entry.catatan || '',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setFormError('');
    const res = updateKuaDirectoryEntry(editingEntry.kua, {
      alamat: form.alamat,
      telp: form.telp,
      whatsapp: form.whatsapp,
      email: form.email,
      kepalaKua: form.kepalaKua,
      jamLayanan: form.jamLayanan,
      mapsUrl: form.mapsUrl,
      catatan: form.catatan,
    });
    if (!res.ok) {
      setFormError(res.error || 'Gagal menyimpan perubahan Direktori KUA.');
      return;
    }
    setEditingEntry(null);
  };

  const previewMapsUrl = editingEntry
    ? buildKuaGoogleMapsUrl({
        kua: editingEntry.kua,
        alamat: form.alamat || editingEntry.alamat,
        mapsUrl: form.mapsUrl,
      })
    : '';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Pengaturan Direktori 16 KUA Kabupaten Jepara
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur alamat kantor, nomor telepon/WhatsApp aktif, jam buka layanan, kepala KUA, email, serta tautan Google Maps masing-masing KUA. Perubahan langsung tersinkronisasi ke portal publik.
          </p>
        </div>
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari KUA, alamat, nomor, kepala..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs outline-none focus:border-[#0F684E]"
          />
        </div>
      </div>

      {/* Grid 16 KUA */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEntries.map((entry) => {
          const desaCount = DESA_PER_KUA_JEPARA[entry.kua]?.length || 0;
          const waNormalized = normalizeWhatsAppNumber(entry.whatsapp || '');
          const mapsHref = buildKuaGoogleMapsUrl(entry);

          return (
            <div
              key={entry.kua}
              className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:border-[#0F684E]/50 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#0F684E] dark:text-emerald-400">
                      {entry.kua}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {desaCount} Desa / Kelurahan Wilayah Layanan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditor(entry)}
                    aria-label={`Sunting ${entry.kua}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 hover:bg-slate-50 dark:hover:bg-emerald-950/60 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 text-slate-700 dark:text-slate-200 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0F684E] dark:text-emerald-400" />
                    Atur KUA
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Buka lokasi ${entry.kua} di Google Maps`}
                    className="group text-slate-600 dark:text-slate-300 hover:text-[#0F684E] dark:hover:text-emerald-400 flex items-start gap-2 leading-relaxed transition"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#0F684E] dark:text-emerald-400" />
                    <span className="underline decoration-dotted underline-offset-2 group-hover:decoration-solid">
                      {entry.alamat}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  <p className="font-mono-num text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{entry.telp}</span>
                  </p>

                  {entry.whatsapp && (
                    <p className="font-mono-num text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      {waNormalized ? (
                        <a
                          href={`https://wa.me/${waNormalized}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          WA: {entry.whatsapp}
                        </a>
                      ) : (
                        <span>WA: {entry.whatsapp}</span>
                      )}
                    </p>
                  )}

                  <p className="text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span className="whitespace-pre-line leading-snug">{entry.jamLayanan}</span>
                  </p>

                  {entry.kepalaKua && (
                    <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">Kepala KUA: {entry.kepalaKua}</span>
                    </p>
                  )}

                  {entry.email && (
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{entry.email}</span>
                    </p>
                  )}

                  {entry.catatan && (
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-lg px-2.5 py-1.5">
                      {entry.catatan}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-emerald-950 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>
                  {entry.updatedAt
                    ? `Diperbarui ${formatIndonesianDate(entry.updatedAt)}`
                    : 'Data standar Kemenag'}
                </span>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
                >
                  <MapPin className="w-3 h-3" />
                  Google Maps
                </a>
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-8 text-center text-xs text-slate-500">
            Tidak ada KUA yang cocok dengan kata kunci &ldquo;{search}&rdquo;.
          </div>
        )}
      </div>

      {/* Modal Sunting Direktori KUA */}
      {editingEntry && (
        <ModalDialog
          open={Boolean(editingEntry)}
          onClose={() => setEditingEntry(null)}
          title={`Atur Direktori — ${editingEntry.kua}`}
          subtitle="Data alamat, nomor aktif, jam layanan, dan tautan Google Maps langsung tampil pada Direktori 16 KUA."
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label htmlFor="kua-edit-alamat" className="block font-semibold text-slate-700 dark:text-slate-200">
                Alamat Lengkap Kantor KUA *
              </label>
              <textarea
                id="kua-edit-alamat"
                rows={2}
                required
                value={form.alamat}
                onChange={(e) => setForm((prev) => ({ ...prev, alamat: e.target.value }))}
                placeholder="Contoh: Jl. KH. Wahid Hasyim, Potroyudan, Kec. Jepara"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="kua-edit-telp" className="block font-semibold text-slate-700 dark:text-slate-200">
                  Nomor Telepon / Kontak Aktif *
                </label>
                <input
                  id="kua-edit-telp"
                  type="text"
                  required
                  value={form.telp}
                  onChange={(e) => setForm((prev) => ({ ...prev, telp: e.target.value }))}
                  placeholder="Contoh: 0291-591014 / 0812-3456-7890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="kua-edit-wa" className="block font-semibold text-slate-700 dark:text-slate-200">
                  Nomor WhatsApp Layanan (Opsional)
                </label>
                <input
                  id="kua-edit-wa"
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="Contoh: 0813-2500-1010"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="kua-edit-jam" className="block font-semibold text-slate-700 dark:text-slate-200">
                  Jam Buka / Layanan *
                </label>
                <textarea
                  id="kua-edit-jam"
                  rows={2}
                  required
                  value={form.jamLayanan}
                  onChange={(e) => setForm((prev) => ({ ...prev, jamLayanan: e.target.value }))}
                  placeholder={"Senin–Kamis, 07.30–16.00 WIB\nJum'at, 07.30–16.30 WIB"}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="kua-edit-email" className="block font-semibold text-slate-700 dark:text-slate-200">
                  Email Resmi KUA (Opsional)
                </label>
                <input
                  id="kua-edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Contoh: kua.jepara@kemenag.go.id"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="kua-edit-kepala" className="block font-semibold text-slate-700 dark:text-slate-200">
                  Nama Kepala KUA / Koordinator (Opsional)
                </label>
                <input
                  id="kua-edit-kepala"
                  type="text"
                  value={form.kepalaKua}
                  onChange={(e) => setForm((prev) => ({ ...prev, kepalaKua: e.target.value }))}
                  placeholder="Contoh: H. Ahmad Fauzan, S.Ag."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="kua-edit-maps" className="block font-semibold text-slate-700 dark:text-slate-200">
                  Tautan Google Maps Langsung (Opsional)
                </label>
                <input
                  id="kua-edit-maps"
                  type="url"
                  value={form.mapsUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, mapsUrl: e.target.value }))}
                  placeholder="Kosongkan untuk tautan otomatis dari alamat"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="kua-edit-catatan" className="block font-semibold text-slate-700 dark:text-slate-200">
                Catatan Layanan Tambahan (Opsional)
              </label>
              <input
                id="kua-edit-catatan"
                type="text"
                value={form.catatan}
                onChange={(e) => setForm((prev) => ({ ...prev, catatan: e.target.value }))}
                placeholder="Contoh: Pendaftaran Bimwin dibuka setiap Selasa & Kamis pukul 08.00–12.00 WIB"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Pratinjau tautan Google Maps aktif untuk {editingEntry.kua}:
              </span>
              <a
                href={previewMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                Uji Tautan Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {formError && (
              <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-emerald-950">
              <button
                type="button"
                onClick={() => {
                  const targetKua = editingEntry.kua;
                  requestConfirm({
                    title: `Pulihkan Data Default ${targetKua}?`,
                    message:
                      'Alamat, nomor kontak, jam buka, dan catatan khusus akan dikembalikan ke data awal Kemenag Jepara.',
                    confirmLabel: 'Pulihkan Default',
                    danger: true,
                    onConfirm: () => {
                      resetKuaDirectoryEntry(targetKua);
                      setEditingEntry(null);
                    },
                  });
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Pulihkan Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        </ModalDialog>
      )}
    </div>
  );
};
