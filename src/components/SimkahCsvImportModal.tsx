import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useBimwin } from '../store/useBimwinStore';
import {
  buildSimkahCsvTemplate,
  detectDuplicatePeserta,
  parseSimkahCsv,
} from '../utils/operationalTools';
import { ModalDialog } from './UiPrimitives';

interface SimkahCsvImportModalProps {
  open: boolean;
  onClose: () => void;
  lockToKua?: string;
}

export const SimkahCsvImportModal: React.FC<SimkahCsvImportModalProps> = ({
  open,
  onClose,
  lockToKua,
}) => {
  const { data, importPesertaBatch } = useBimwin();
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');

  const analysis = useMemo(() => {
    if (!csvText.trim()) return null;
    const parsed = parseSimkahCsv(csvText, {
      defaultKua: lockToKua || 'KUA Jepara',
      lockToKua,
    });
    const dupCheck = detectDuplicatePeserta(parsed.validRows, data.users);
    return {
      parseErrors: parsed.errors,
      cleanRows: dupCheck.cleanRows,
      duplicates: dupCheck.duplicates,
    };
  }, [csvText, data.users, lockToKua]);

  const handleDownloadTemplate = () => {
    const content = buildSimkahCsvTemplate(lockToKua || 'KUA Jepara');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-simkah-${(lockToKua || 'semua-kua').toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ''));
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = () => {
    if (!analysis || analysis.cleanRows.length === 0) return;
    importPesertaBatch(analysis.cleanRows);
    setCsvText('');
    setFileName('');
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Impor Data Catin Massal (CSV / SIMKAH)"
      subtitle={
        lockToKua
          ? `Cakupan Wilayah Terkunci: ${lockToKua} · Deteksi Otomatis NIK Ganda`
          : 'Cakupan Admin Kemenag: Seluruh 16 KUA Kab. Jepara · Deteksi Otomatis NIK Ganda'
      }
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={!analysis || analysis.cleanRows.length === 0}
            onClick={handleImport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-40 text-white text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor {analysis ? analysis.cleanRows.length : 0} Peserta Valid
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
          <div className="flex items-start gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-[#0F684E] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white">
                Format CSV Resmi Kompatibel Ekspor SIMKAH &amp; Excel
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Mendukung pemisah koma (,) atau titik koma (;). Sistem otomatis memeriksa NIK 16 digit dan mencegah akun ganda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#111C18] text-[#0F684E] dark:text-emerald-300 text-xs font-semibold shrink-0 hover:bg-emerald-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Template CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Unggah File CSV (.csv)
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-emerald-800 bg-[#F8FAF9] dark:bg-[#0D1613] hover:border-[#0F684E] cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200 transition">
              <Upload className="w-4 h-4 text-[#0F684E]" />
              <span>{fileName || 'Pilih file CSV dari komputer / HP'}</span>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => {
                setCsvText(buildSimkahCsvTemplate(lockToKua || 'KUA Jepara'));
                setFileName('contoh-simkah.csv');
              }}
              className="px-3.5 py-3 rounded-xl border border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#111C18] hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              Isi Contoh Data SIMKAH (Uji Coba)
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="simkah-csv-textarea"
            className="block text-xs font-semibold mb-1"
          >
            Atau Tempel Isi CSV Secara Langsung
          </label>
          <textarea
            id="simkah-csv-textarea"
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="nama,nik,jenis_kelamin,hp,email,kua,desa,tanggal_akad,pendidikan"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-xs"
          />
        </div>

        {analysis && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30">
                <p className="text-[11px] text-slate-500">Siap Diimpor</p>
                <p className="font-mono-num text-lg font-bold text-[#0F684E] dark:text-emerald-400">
                  {analysis.cleanRows.length}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20">
                <p className="text-[11px] text-slate-500">Duplikat NIK Dilewati</p>
                <p className="font-mono-num text-lg font-bold text-amber-700 dark:text-amber-400">
                  {analysis.duplicates.length}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20">
                <p className="text-[11px] text-slate-500">Format Baris Tidak Valid</p>
                <p className="font-mono-num text-lg font-bold text-red-700 dark:text-red-400">
                  {analysis.parseErrors.length}
                </p>
              </div>
            </div>

            {analysis.cleanRows.length > 0 && (
              <div className="border border-slate-200 dark:border-emerald-950 rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-[#0D1613] text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F684E]" />
                  Pratinjau Peserta Valid (Kata sandi awal otomatis: catin + 4 digit akhir NIK)
                </div>
                <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-emerald-950/60 text-xs">
                  {analysis.cleanRows.map((row) => (
                    <div
                      key={`${row.rowNumber}-${row.nik}`}
                      className="px-3 py-2 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{row.nama}</p>
                        <p className="text-[11px] font-mono-num text-slate-500">
                          NIK: {row.nik} · @{row.suggestedUsername}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-[#0F684E] dark:text-emerald-400">
                          {row.kua} · {row.desa}
                        </p>
                        <p>Akad: {row.rencanaAkad}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(analysis.duplicates.length > 0 || analysis.parseErrors.length > 0) && (
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-xs space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Baris Dilewati ({analysis.duplicates.length + analysis.parseErrors.length})
                </p>
                {analysis.duplicates.slice(0, 5).map((d) => (
                  <p key={`dup-${d.rowNumber}`} className="text-[11px] text-amber-900 dark:text-amber-200">
                    Baris {d.rowNumber} ({d.nama}): {d.reason}
                  </p>
                ))}
                {analysis.parseErrors.slice(0, 5).map((err) => (
                  <p key={`err-${err.rowNumber}`} className="text-[11px] text-red-700 dark:text-red-300">
                    Baris {err.rowNumber}: {err.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
