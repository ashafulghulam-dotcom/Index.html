import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookMarked,
  Database,
  Edit3,
  Eye,
  EyeOff,
  Upload,
  FileSpreadsheet,
  History,
  MessageSquare,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DESA_PER_KUA_JEPARA, LIST_16_KUA } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { BimwinUser, ModuleDefinition, QuizQuestion } from '../types/bimwin';
import {
  buildPesertaCsv,
  countUniqueSyncedCouples,
  evaluatePesertaStep,
  formatIndonesianDate,
  isUnderageMarriage,
  maskNik,
  normalizeVillageName,
} from '../utils/bimwinLogic';
import { buildExecutiveReportRows, ExecutiveReportData } from '../utils/pdfDocuments';
import { CertificatePreviewModal, ExecutiveReportPreviewModal } from './OfficialDocuments';
import { ModalDialog } from './UiPrimitives';
import { NavItem, WorkspaceShell } from './WorkspaceShell';

export const AdminDashboard: React.FC = () => {
  const {
    data,
    currentUser,
    darkMode,
    updatePesertaByAdmin,
    deleteUserByAdmin,
    saveStaffAccount,
    updateModuleCurriculum,
    updateAssessmentQuiz,
    updateSystemSettings,
    addFaq,
    deleteFaq,
    addDocument,
    deleteDocument,
    addGalleryItem,
    deleteGalleryItem,
    replyKritikSaran,
    sendReminderNotification,
    importBackupJson,
    resetDemoDatabase,
    requestConfirm,
  } = useBimwin();

  const isSuper = currentUser?.role === 'SuperAdmin';
  const [activeTab, setActiveTab] = useState('analitik');

  // Filters
  const [selectedKua, setSelectedKua] = useState<string>(isSuper ? 'ALL' : currentUser?.kua || 'KUA Jepara');
  const [search, setSearch] = useState('');

  // Peserta Edit, Certificate Preview & Executive Report modals
  const [editingPeserta, setEditingPeserta] = useState<BimwinUser | null>(null);
  const [certPreviewUser, setCertPreviewUser] = useState<BimwinUser | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Staff manager state
  const [revealedPassIds, setRevealedPassIds] = useState<Record<string, boolean>>({});
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    id: '' as string | undefined,
    username: '',
    password: '',
    nama: '',
    role: 'Fasilitator' as 'AdminKUA' | 'Fasilitator',
    kua: 'KUA Jepara',
    jabatan: '',
    nip: '',
  });
  const [staffErr, setStaffErr] = useState('');

  // LMS Curriculum Editor state (Modul 1-5 + Pretest + Postest)
  const [lmsSection, setLmsSection] = useState<'modul' | 'pretest' | 'postest'>('modul');
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const selectedModule = data.modules.find((m) => m.id === selectedModuleId) || data.modules[0];
  const [lmsDraft, setLmsDraft] = useState<ModuleDefinition>(selectedModule);
  const [assessmentDraft, setAssessmentDraft] = useState<QuizQuestion[]>(data.pretest);

  // Settings & CMS state
  const [settingsDraft, setSettingsDraft] = useState(data.settings);
  const [newFaq, setNewFaq] = useState({ t: '', j: '' });
  const [newDoc, setNewDoc] = useState({ judul: '', kat: 'Dokumen Nikah', url: '' });
  const [newGal, setNewGal] = useState({ judul: '', kua: 'KUA Jepara', tanggal: 'April 2026', deskripsi: '' });
  const restoreFileRef = useRef<HTMLInputElement | null>(null);

  // Kritik reply, IKM filter, Audit search & broadcast reminder
  const [kritikReplies, setKritikReplies] = useState<Record<string, string>>({});
  const [ikmKuaFilter, setIkmKuaFilter] = useState<string>(isSuper ? 'ALL' : currentUser?.kua || 'KUA Jepara');
  const [auditSearch, setAuditSearch] = useState('');
  const [broadcastKua, setBroadcastKua] = useState(isSuper ? 'ALL' : currentUser?.kua || 'KUA Jepara');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Keep drafts synced when database resets/restores or active user changes
  useEffect(() => {
    setSettingsDraft(data.settings);
  }, [data.settings]);

  useEffect(() => {
    const found = data.modules.find((m) => m.id === selectedModuleId) || data.modules[0];
    if (found) setLmsDraft(found);
  }, [data.modules, selectedModuleId]);

  useEffect(() => {
    if (lmsSection === 'pretest') setAssessmentDraft(data.pretest);
    if (lmsSection === 'postest') setAssessmentDraft(data.postest);
  }, [lmsSection, data.pretest, data.postest]);

  useEffect(() => {
    if (!currentUser) return;
    const scope = currentUser.role === 'SuperAdmin' ? 'ALL' : currentUser.kua;
    setSelectedKua(scope);
    setIkmKuaFilter(scope);
    setBroadcastKua(scope);
  }, [currentUser?.id, currentUser?.role, currentUser?.kua]);

  if (!currentUser) return null;

  const effectiveKua = isSuper ? selectedKua : currentUser.kua;

  const scopedPeserta = useMemo(() => {
    return data.users.filter(
      (u) => u.role === 'Peserta' && (effectiveKua === 'ALL' || u.kua === effectiveKua)
    );
  }, [data.users, effectiveKua]);

  const filteredTablePeserta = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedPeserta.filter(
      (u) =>
        !q ||
        u.nama.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.desaTempatNikah || '').toLowerCase().includes(q) ||
        (u.progress?.nomorSertifikat || '').toLowerCase().includes(q)
    );
  }, [scopedPeserta, search]);

  // KPI metrics
  const kpis = useMemo(() => {
    const total = scopedPeserta.length;
    const couples = countUniqueSyncedCouples(scopedPeserta);
    const verified = scopedPeserta.filter((u) => u.progress?.verifikasiFasilitator).length;
    const riskGizi = scopedPeserta.filter((u) => u.stunting?.status === 'Perlu Perhatian Gizi').length;
    const underage = scopedPeserta.filter((u) => isUnderageMarriage(u.usia)).length;
    const scopedIkm = data.ikmSurveys.filter(
      (i) => effectiveKua === 'ALL' || i.kua === effectiveKua
    );
    const avgIkm =
      scopedIkm.length > 0
        ? (scopedIkm.reduce((s, x) => s + x.rating, 0) / scopedIkm.length).toFixed(2)
        : '5.00';

    const withBothTests = scopedPeserta.filter(
      (u) => u.progress?.pretestDone && u.progress?.postestDone
    );
    const avgPre =
      withBothTests.length > 0
        ? Math.round(
            withBothTests.reduce((s, u) => s + (u.progress?.pretestScore || 0), 0) /
              withBothTests.length
          )
        : 0;
    const avgPost =
      withBothTests.length > 0
        ? Math.round(
            withBothTests.reduce((s, u) => s + (u.progress?.postestScore || 0), 0) /
              withBothTests.length
          )
        : 0;

    return { total, couples, verified, riskGizi, underage, avgIkm, avgPre, avgPost };
  }, [scopedPeserta, data.ikmSurveys, effectiveKua]);

  // 16 KUA Compliance Heatmap
  const heatmap16Kua = useMemo(() => {
    const allPeserta = data.users.filter((u) => u.role === 'Peserta');
    return LIST_16_KUA.map((kua) => {
      const items = allPeserta.filter((u) => u.kua === kua);
      const lulus = items.filter((u) => u.progress?.verifikasiFasilitator).length;
      const rate = items.length > 0 ? Math.round((lulus / items.length) * 100) : 0;
      return { kua, shortName: kua.replace('KUA ', ''), total: items.length, lulus, rate };
    });
  }, [data.users]);

  // Distribution Chart (16 KUA when ALL, or Desa/Kelurahan when drilled down)
  const distributionData = useMemo(() => {
    if (effectiveKua === 'ALL') {
      return heatmap16Kua.map((h) => ({
        name: h.shortName,
        Peserta: h.total,
        Lulus: h.lulus,
      }));
    }
    const villages = DESA_PER_KUA_JEPARA[effectiveKua] || [];
    const counts: Record<string, { total: number; lulus: number }> = {};
    villages.forEach((v) => {
      counts[v] = { total: 0, lulus: 0 };
    });
    scopedPeserta.forEach((u) => {
      const v = normalizeVillageName(u.desaTempatNikah, u.kua);
      if (!counts[v]) counts[v] = { total: 0, lulus: 0 };
      counts[v].total += 1;
      if (u.progress?.verifikasiFasilitator) counts[v].lulus += 1;
    });
    return Object.entries(counts)
      .filter(([, c]) => c.total > 0)
      .map(([name, c]) => ({ name, Peserta: c.total, Lulus: c.lulus }));
  }, [effectiveKua, heatmap16Kua, scopedPeserta]);

  // Education Pie Data
  const educationData = useMemo(() => {
    const map: Record<string, number> = {};
    scopedPeserta.forEach((u) => {
      const edu = u.pendidikan || 'Lainnya';
      map[edu] = (map[edu] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [scopedPeserta]);

  const PIE_COLORS = ['#0F684E', '#C69214', '#2563EB', '#0D9488', '#64748B', '#D97706'];

  const executiveReport: ExecutiveReportData = useMemo(() => {
    const scopeLabel = effectiveKua === 'ALL' ? 'Semua 16 KUA Kabupaten Jepara' : effectiveKua;
    const unitColumnLabel = effectiveKua === 'ALL' ? 'Unit KUA Kecamatan' : 'Desa / Kelurahan';
    const kuaCode =
      effectiveKua === 'ALL'
        ? 'JPR16'
        : effectiveKua.replace('KUA ', '').slice(0, 3).toUpperCase();
    return {
      reportCode: `LAP-BIMWIN-2026-${kuaCode}`,
      scopeLabel,
      unitColumnLabel,
      printedDate: formatIndonesianDate(),
      kpis,
      rows: buildExecutiveReportRows(distributionData),
      educationSummary: educationData,
      pejabat: data.settings.pejabat,
    };
  }, [effectiveKua, kpis, distributionData, educationData, data.settings.pejabat]);

  const handleExportCsv = () => {
    const csv = buildPesertaCsv(scopedPeserta);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap-Bimwin-${effectiveKua.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBackupJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup-BIMWIN-Kemenag-Jepara-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const staffList = useMemo(
    () => data.users.filter((u) => u.role === 'AdminKUA' || u.role === 'Fasilitator'),
    [data.users]
  );

  const navItems: NavItem[] = [
    { id: 'analitik', label: 'Analitik & Peta 16 KUA', icon: BarChart3, section: 'Eksekutif' },
    { id: 'peserta', label: 'Data Peserta Catin', icon: Users, badge: scopedPeserta.length, section: 'Eksekutif' },
    { id: 'ikm', label: 'Survei IKM & Kritik Saran', icon: MessageSquare, badge: data.kritikSaran.length, section: 'Layanan Publik' },
    { id: 'pengingat', label: 'Broadcast Pengingat', icon: Bell, section: 'Layanan Publik' },
    ...(isSuper
      ? [
          { id: 'lms', label: 'Manajemen Kurikulum LMS', icon: BookMarked, section: 'SuperAdmin Kemenag' },
          { id: 'petugas', label: 'Akun Admin & Fasilitator', icon: Shield, badge: staffList.length, section: 'SuperAdmin Kemenag' },
          { id: 'pengaturan', label: 'Pengaturan, Konten & Backup', icon: Settings, section: 'SuperAdmin Kemenag' },
          { id: 'audit', label: 'Audit Trail Aktivitas', icon: History, badge: data.auditLogs.length, section: 'SuperAdmin Kemenag' },
        ]
      : []),
  ];

  return (
    <WorkspaceShell
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      roleLabel={isSuper ? 'SuperAdmin Kemenag' : `Admin ${currentUser.kua}`}
    >
      {/* TAB 1: ANALITIK & HEATMAP 16 KUA */}
      {activeTab === 'analitik' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Ringkasan Eksekutif — {effectiveKua === 'ALL' ? '16 KUA Kabupaten Jepara' : effectiveKua}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan kepatuhan kelulusan, capaian Before-After, gizi stunting, dan mutu IKM.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              {isSuper && (
                <select
                  value={selectedKua}
                  onChange={(e) => setSelectedKua(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
                >
                  <option value="ALL">Semua 16 KUA Jepara</option>
                  {LIST_16_KUA.map((kua) => (
                    <option key={kua} value={kua}>
                      {kua}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F684E]" />
                Ekspor CSV
              </button>
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Laporan A4
              </button>
            </div>
          </div>

          {/* 5 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { label: 'Total Peserta', value: kpis.total, sub: `${kpis.couples} pasangan tersinkron` },
              { label: 'Sertifikat Terbit', value: kpis.verified, sub: `${kpis.total ? Math.round((kpis.verified / kpis.total) * 100) : 0}% kelulusan` },
              { label: 'Before → After', value: `${kpis.avgPre} → ${kpis.avgPost}`, sub: `Gain +${Math.max(0, kpis.avgPost - kpis.avgPre)} poin` },
              { label: 'Risiko Gizi / <19 Th', value: `${kpis.riskGizi} / ${kpis.underage}`, sub: 'Perlu atensi KUA & PA' },
              { label: 'Rata-rata IKM', value: `${kpis.avgIkm} / 5`, sub: 'Indeks Kepuasan Layanan' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
                <p className="font-mono-num text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {item.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* SuperAdmin 16-KUA Compliance Heatmap */}
          {isSuper && (
            <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Peta Kepatuhan Kelulusan 16 KUA Kecamatan (Heatmap)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik salah satu KUA untuk melihat rincian drill-down hingga tingkat Desa/Kelurahan.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> ≥80% Optimal
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> 50–79% Sedang
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> &lt;50% Perlu Atensi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {heatmap16Kua.map((h) => {
                  const selected = selectedKua === h.kua;
                  const tone =
                    h.rate >= 80
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                      : h.rate >= 50
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        : 'border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200';
                  return (
                    <button
                      key={h.kua}
                      type="button"
                      onClick={() => setSelectedKua(selected ? 'ALL' : h.kua)}
                      className={`p-3 rounded-xl border text-left transition ${tone} ${
                        selected ? 'ring-2 ring-[#0F684E]' : 'hover:opacity-90'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{h.shortName}</p>
                      <p className="font-mono-num text-lg font-bold mt-0.5">{h.rate}%</p>
                      <p className="font-mono-num text-[10px] opacity-80">
                        {h.lulus}/{h.total} lulus
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {effectiveKua === 'ALL'
                    ? 'Sebaran Peserta & Kelulusan per KUA'
                    : `Sebaran Peserta per Desa/Kelurahan (${effectiveKua})`}
                </h3>
                {isSuper && effectiveKua !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedKua('ALL')}
                    className="text-xs font-semibold text-[#0F684E] hover:underline"
                  >
                    Kembali ke 16 KUA
                  </button>
                )}
              </div>
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="h-72 min-w-[580px] sm:min-w-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -16, bottom: 26 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e3a32' : '#e2e8f0'} />
                      <XAxis
                        dataKey="name"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#475569' }}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#475569' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0D1613' : '#FFFFFF',
                          borderColor: darkMode ? '#14532d' : '#e2e8f0',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="Peserta" fill="#0F684E" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Lulus" fill="#C69214" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Demografi Pendidikan Peserta</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={educationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {educationData.map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                {educationData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {item.name}
                    </span>
                    <span className="font-mono-num font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA PESERTA */}
      {activeTab === 'peserta' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">
              Manajemen Data Peserta ({filteredTablePeserta.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, desa, sertifikat..."
                  className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs"
                />
              </div>
              {isSuper && (
                <select
                  value={selectedKua}
                  onChange={(e) => setSelectedKua(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs"
                >
                  <option value="ALL">Semua 16 KUA</option>
                  {LIST_16_KUA.map((kua) => (
                    <option key={kua} value={kua}>
                      {kua}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F8FAF9] dark:bg-[#0D1613] border-b border-slate-200 dark:border-emerald-950">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Nama &amp; NIK</th>
                    <th className="text-left px-4 py-3 font-semibold">KUA &amp; Desa</th>
                    <th className="text-left px-4 py-3 font-semibold">Pasangan</th>
                    <th className="text-left px-4 py-3 font-semibold">Progres &amp; Gizi</th>
                    <th className="text-right px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-emerald-950">
                  {filteredTablePeserta.map((u) => {
                    const step = evaluatePesertaStep(u, data.modules.length);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-emerald-950/20">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{u.nama}</p>
                          <p className="font-mono-num text-[11px] text-slate-500">
                            {maskNik(u.nik)} · {u.usia ?? '-'} th
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F684E] dark:text-emerald-400">{u.kua}</p>
                          <p className="text-[11px] text-slate-500">
                            {normalizeVillageName(u.desaTempatNikah, u.kua)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p>{u.pasanganNama || 'Belum Tersinkron'}</p>
                          {u.progress?.nomorSertifikat && (
                            <p className="font-mono-num text-[10px] text-slate-500">
                              {u.progress.nomorSertifikat}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono-num">
                          <p className="font-bold">
                            {step.progressPercent}% ·{' '}
                            {u.progress?.verifikasiFasilitator ? 'Sah' : 'Proses'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Gizi: {u.stunting?.status || 'Belum Cek'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {u.progress?.verifikasiFasilitator && (
                              <button
                                type="button"
                                onClick={() => setCertPreviewUser(u)}
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-[#0F684E] dark:text-emerald-300 font-semibold"
                              >
                                Sertifikat
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingPeserta(u)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 hover:bg-slate-100 dark:hover:bg-emerald-950"
                              aria-label="Edit peserta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                requestConfirm({
                                  title: 'Hapus Akun Peserta?',
                                  message: `Data peserta "${u.nama}" akan dihapus dari sistem.`,
                                  confirmLabel: 'Hapus Peserta',
                                  danger: true,
                                  onConfirm: () => deleteUserByAdmin(u.id),
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              aria-label="Hapus peserta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SURVEI IKM & KRITIK SARAN */}
      {activeTab === 'ikm' && (() => {
        const effectiveIkmKua = isSuper ? ikmKuaFilter : currentUser.kua;
        const visibleIkm = data.ikmSurveys.filter(
          (i) => effectiveIkmKua === 'ALL' || i.kua === effectiveIkmKua
        );
        const visibleKritik = data.kritikSaran.filter(
          (k) => effectiveIkmKua === 'ALL' || k.kua === effectiveIkmKua
        );
        return (
          <div className="space-y-4">
            {isSuper && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Menampilkan umpan balik untuk{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {effectiveIkmKua === 'ALL' ? 'Semua 16 KUA' : effectiveIkmKua}
                  </strong>
                </p>
                <select
                  value={ikmKuaFilter}
                  onChange={(e) => setIkmKuaFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
                >
                  <option value="ALL">Semua 16 KUA Jepara</option>
                  {LIST_16_KUA.map((kua) => (
                    <option key={kua} value={kua}>
                      {kua}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h2 className="font-display text-xl font-semibold">
                  Ulasan Survei IKM ({visibleIkm.length})
                </h2>
                {visibleIkm.length === 0 ? (
                  <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-6 text-center text-xs text-slate-500">
                    Belum ada ulasan IKM pada wilayah terpilih.
                  </div>
                ) : (
                  visibleIkm.map((ikm) => (
                    <div
                      key={ikm.id}
                      className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-bold">
                          {ikm.nama} · <span className="text-[#0F684E] dark:text-emerald-400">{ikm.kua}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono-num font-bold text-amber-600 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" /> {ikm.rating}/5
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500">{ikm.aspek}</p>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">{ikm.ulasan}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-semibold">
                  Kritik &amp; Saran Publik ({visibleKritik.length})
                </h2>
                {visibleKritik.length === 0 ? (
                  <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-6 text-center text-xs text-slate-500">
                    Belum ada kritik atau saran pada wilayah terpilih.
                  </div>
                ) : (
                  visibleKritik.map((ks) => (
                    <div
                      key={ks.id}
                      className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-bold">
                          {ks.nama} · {ks.kua}
                        </span>
                        <span className="font-mono-num text-slate-500 shrink-0">
                          {formatIndonesianDate(ks.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">{ks.pesan}</p>
                      {ks.balasanAdmin ? (
                        <p className="text-xs p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                          <strong>Tanggapan Admin:</strong> {ks.balasanAdmin}
                        </p>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={kritikReplies[ks.id] || ''}
                            onChange={(e) =>
                              setKritikReplies((prev) => ({ ...prev, [ks.id]: e.target.value }))
                            }
                            placeholder="Tulis tanggapan resmi..."
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!kritikReplies[ks.id]?.trim()) return;
                              replyKritikSaran(ks.id, kritikReplies[ks.id]);
                              setKritikReplies((prev) => ({ ...prev, [ks.id]: '' }));
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0F684E] text-white text-xs font-semibold shrink-0"
                          >
                            Balas
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: BROADCAST PENGINGAT */}
      {activeTab === 'pengingat' && (
        <div className="max-w-xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Kirim Pengingat Resmi ke Peserta</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
              sendReminderNotification(broadcastKua, broadcastTitle, broadcastMsg);
              setBroadcastTitle('');
              setBroadcastMsg('');
            }}
            className="space-y-3.5 text-xs sm:text-sm"
          >
            {isSuper && (
              <div>
                <label className="block font-semibold mb-1">Wilayah Tujuan</label>
                <select
                  value={broadcastKua}
                  onChange={(e) => setBroadcastKua(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                >
                  <option value="ALL">Seluruh 16 KUA Kabupaten Jepara</option>
                  {LIST_16_KUA.map((kua) => (
                    <option key={kua} value={kua}>
                      {kua}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1">Judul Pengingat *</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Pesan Pengingat *</label>
              <textarea
                rows={4}
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
            >
              Kirim Pengingat
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: MANAJEMEN KURIKULUM LMS (SUPERADMIN) */}
      {isSuper && activeTab === 'lms' && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">Manajemen Kurikulum LMS</h2>
              <p className="text-xs text-slate-500">
                Perbarui judul modul, tautan video, intisari materi, serta bank soal Pretest, 5 Modul, dan Postest.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.modules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setLmsSection('modul');
                    setSelectedModuleId(m.id);
                    setLmsDraft(m);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    lmsSection === 'modul' && selectedModuleId === m.id
                      ? 'bg-[#0F684E] text-white'
                      : 'bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950'
                  }`}
                >
                  Modul {m.id}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setLmsSection('pretest');
                  setAssessmentDraft(data.pretest);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  lmsSection === 'pretest'
                    ? 'bg-[#0F684E] text-white'
                    : 'bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950'
                }`}
              >
                Soal Pretest
              </button>
              <button
                type="button"
                onClick={() => {
                  setLmsSection('postest');
                  setAssessmentDraft(data.postest);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  lmsSection === 'postest'
                    ? 'bg-[#0F684E] text-white'
                    : 'bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950'
                }`}
              >
                Soal Postest
              </button>
            </div>
          </div>

          {lmsSection === 'modul' ? (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Judul Lengkap Modul {lmsDraft.id}</label>
                <input
                  type="text"
                  value={lmsDraft.judul}
                  onChange={(e) => setLmsDraft({ ...lmsDraft, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Deskripsi Ringkas</label>
                  <input
                    type="text"
                    value={lmsDraft.desc}
                    onChange={(e) => setLmsDraft({ ...lmsDraft, desc: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">URL Video Embed YouTube</label>
                  <input
                    type="url"
                    value={lmsDraft.videoUrl}
                    onChange={(e) => setLmsDraft({ ...lmsDraft, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Intisari Kunci Evaluasi</label>
                <textarea
                  rows={2}
                  value={lmsDraft.keyTakeaway}
                  onChange={(e) => setLmsDraft({ ...lmsDraft, keyTakeaway: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-emerald-950">
                <h3 className="font-bold text-sm">
                  Bank Soal Kuis Modul {lmsDraft.id} ({lmsDraft.quiz.length} Soal)
                </h3>
                {lmsDraft.quiz.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-2"
                  >
                    <input
                      type="text"
                      value={q.q}
                      onChange={(e) => {
                        const nextQuiz = lmsDraft.quiz.map((item, i) =>
                          i === qIdx ? { ...item, q: e.target.value } : item
                        );
                        setLmsDraft({ ...lmsDraft, quiz: nextQuiz });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.opt.map((optText, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`ans_${q.id}`}
                            checked={q.ans === oIdx}
                            onChange={() => {
                              const nextQuiz = lmsDraft.quiz.map((item, i) =>
                                i === qIdx ? { ...item, ans: oIdx } : item
                              );
                              setLmsDraft({ ...lmsDraft, quiz: nextQuiz });
                            }}
                            className="accent-[#0F684E]"
                          />
                          <input
                            type="text"
                            value={optText}
                            onChange={(e) => {
                              const nextQuiz = lmsDraft.quiz.map((item, i) =>
                                i === qIdx
                                  ? {
                                      ...item,
                                      opt: item.opt.map((o, j) => (j === oIdx ? e.target.value : o)),
                                    }
                                  : item
                              );
                              setLmsDraft({ ...lmsDraft, quiz: nextQuiz });
                            }}
                            className="flex-1 px-2.5 py-1 rounded border border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => updateModuleCurriculum(lmsDraft.id, lmsDraft)}
                  className="px-5 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                >
                  Simpan Perubahan Modul {lmsDraft.id}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <h3 className="font-bold text-base">
                  Bank Soal {lmsSection === 'pretest' ? 'Pretest (Evaluasi Awal)' : 'Postest (Evaluasi Akhir)'} ({assessmentDraft.length} Soal)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih tombol radio di kiri pilihan jawaban untuk menetapkan kunci jawaban benar.
                </p>
              </div>
              <div className="space-y-3">
                {assessmentDraft.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-2"
                  >
                    <input
                      type="text"
                      value={q.q}
                      onChange={(e) =>
                        setAssessmentDraft((prev) =>
                          prev.map((item, i) => (i === qIdx ? { ...item, q: e.target.value } : item))
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.opt.map((optText, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`assess_${lmsSection}_${q.id}`}
                            checked={q.ans === oIdx}
                            onChange={() =>
                              setAssessmentDraft((prev) =>
                                prev.map((item, i) => (i === qIdx ? { ...item, ans: oIdx } : item))
                              )
                            }
                            className="accent-[#0F684E]"
                          />
                          <input
                            type="text"
                            value={optText}
                            onChange={(e) =>
                              setAssessmentDraft((prev) =>
                                prev.map((item, i) =>
                                  i === qIdx
                                    ? {
                                        ...item,
                                        opt: item.opt.map((o, j) => (j === oIdx ? e.target.value : o)),
                                      }
                                    : item
                                )
                              )
                            }
                            className="flex-1 px-2.5 py-1 rounded border border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => updateAssessmentQuiz(lmsSection, assessmentDraft)}
                  className="px-5 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                >
                  Simpan Bank Soal {lmsSection === 'pretest' ? 'Pretest' : 'Postest'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AKUN ADMIN KUA & FASILITATOR (SUPERADMIN) */}
      {isSuper && activeTab === 'petugas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Manajemen Akun Admin KUA &amp; Fasilitator ({staffList.length})
              </h2>
              <p className="text-xs text-slate-500">
                Kelola kredensial petugas di seluruh 16 KUA Kecamatan Kabupaten Jepara.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStaffForm({
                  id: undefined,
                  username: '',
                  password: '',
                  nama: '',
                  role: 'Fasilitator',
                  kua: 'KUA Jepara',
                  jabatan: '',
                  nip: '',
                });
                setStaffErr('');
                setStaffModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Tambah Akun Petugas
            </button>
          </div>

          <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F8FAF9] dark:bg-[#0D1613] border-b border-slate-200 dark:border-emerald-950">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Nama Petugas</th>
                    <th className="text-left px-4 py-3 font-semibold">Peran &amp; KUA</th>
                    <th className="text-left px-4 py-3 font-semibold">Username</th>
                    <th className="text-left px-4 py-3 font-semibold">Kata Sandi</th>
                    <th className="text-right px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-emerald-950">
                  {staffList.map((st) => {
                    const shown = Boolean(revealedPassIds[st.id]);
                    return (
                      <tr key={st.id}>
                        <td className="px-4 py-2.5 font-semibold">{st.nama}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-[#0F684E] dark:text-emerald-400">
                            {st.role}
                          </span>{' '}
                          · {st.kua}
                        </td>
                        <td className="px-4 py-2.5 font-mono-num">{st.username}</td>
                        <td className="px-4 py-2.5 font-mono-num">
                          <div className="inline-flex items-center gap-2">
                            <span>{shown ? st.password : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedPassIds((prev) => ({ ...prev, [st.id]: !shown }))
                              }
                              className="text-slate-400 hover:text-slate-700"
                              aria-label="Tampilkan sandi"
                            >
                              {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setStaffForm({
                                  id: st.id,
                                  username: st.username,
                                  password: st.password,
                                  nama: st.nama,
                                  role: st.role as 'AdminKUA' | 'Fasilitator',
                                  kua: st.kua,
                                  jabatan: st.jabatan || '',
                                  nip: st.nip || '',
                                });
                                setStaffErr('');
                                setStaffModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-900"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                requestConfirm({
                                  title: 'Hapus Akun Petugas?',
                                  message: `Akun "${st.username}" akan dihapus.`,
                                  confirmLabel: 'Hapus',
                                  danger: true,
                                  onConfirm: () => deleteUserByAdmin(st.id),
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PENGATURAN SISTEM, KONTEN & BACKUP (SUPERADMIN) */}
      {isSuper && activeTab === 'pengaturan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
            <h2 className="font-display text-xl font-semibold">
              Konfigurasi Sistem &amp; Pejabat Penandatangan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Jabatan Penandatangan</label>
                <input
                  type="text"
                  value={settingsDraft.pejabat.jabatan}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      pejabat: { ...settingsDraft.pejabat, jabatan: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama Pejabat</label>
                <input
                  type="text"
                  value={settingsDraft.pejabat.nama}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      pejabat: { ...settingsDraft.pejabat, nama: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">NIP Pejabat</label>
                <input
                  type="text"
                  value={settingsDraft.pejabat.nip}
                  onChange={(e) =>
                    setSettingsDraft({
                      ...settingsDraft,
                      pejabat: { ...settingsDraft.pejabat, nip: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settingsDraft.maintenanceMode}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, maintenanceMode: e.target.checked })
                }
                className="accent-[#0F684E] w-4 h-4"
              />
              <span className="font-semibold">
                Aktifkan Mode Pemeliharaan Sistem (hanya SuperAdmin yang dapat login)
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-emerald-950">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportBackupJson}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
                >
                  <Database className="w-3.5 h-3.5 text-[#0F684E]" />
                  Unduh Backup JSON
                </button>
                <input
                  ref={restoreFileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        importBackupJson(reader.result);
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => restoreFileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0F684E]" />
                  Pulihkan Backup JSON
                </button>
                <button
                  type="button"
                  onClick={() =>
                    requestConfirm({
                      title: 'Reset Data ke Kondisi Demo Awal?',
                      message: 'Seluruh perubahan lokal akan dikembalikan ke data seed 16 KUA.',
                      confirmLabel: 'Reset Data',
                      danger: true,
                      onConfirm: resetDemoDatabase,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 dark:border-red-900 text-red-600 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Data Demo
                </button>
              </div>
              <button
                type="button"
                onClick={() => updateSystemSettings(settingsDraft)}
                className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                Simpan Pengaturan Sistem
              </button>
            </div>
          </div>

          {/* CMS: FAQ, Dokumen, Galeri */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
            {/* FAQ CRUD */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm">Kelola FAQ Publik ({data.faqs.length})</h3>
              <input
                type="text"
                value={newFaq.t}
                onChange={(e) => setNewFaq({ ...newFaq, t: e.target.value })}
                placeholder="Pertanyaan baru..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <textarea
                rows={2}
                value={newFaq.j}
                onChange={(e) => setNewFaq({ ...newFaq, j: e.target.value })}
                placeholder="Jawaban..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newFaq.t.trim() || !newFaq.j.trim()) return;
                  addFaq(newFaq.t, newFaq.j);
                  setNewFaq({ t: '', j: '' });
                }}
                className="w-full py-1.5 rounded-lg bg-[#0F684E] text-white font-semibold"
              >
                + Tambah FAQ
              </button>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {data.faqs.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 rounded-lg border border-slate-200 dark:border-emerald-950 flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium">{f.t}</span>
                    <button
                      type="button"
                      onClick={() => deleteFaq(f.id)}
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dokumen CRUD */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm">Dokumen Unduhan ({data.documents.length})</h3>
              <input
                type="text"
                value={newDoc.judul}
                onChange={(e) => setNewDoc({ ...newDoc, judul: e.target.value })}
                placeholder="Judul dokumen..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <input
                type="url"
                value={newDoc.url}
                onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newDoc.judul.trim() || !newDoc.url.trim()) return;
                  addDocument(newDoc);
                  setNewDoc({ judul: '', kat: 'Dokumen Nikah', url: '' });
                }}
                className="w-full py-1.5 rounded-lg bg-[#0F684E] text-white font-semibold"
              >
                + Tambah Dokumen
              </button>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {data.documents.map((d) => (
                  <div
                    key={d.id}
                    className="p-2 rounded-lg border border-slate-200 dark:border-emerald-950 flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium">{d.judul}</span>
                    <button
                      type="button"
                      onClick={() => deleteDocument(d.id)}
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Galeri CRUD */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm">Galeri Kegiatan ({data.gallery.length})</h3>
              <input
                type="text"
                value={newGal.judul}
                onChange={(e) => setNewGal({ ...newGal, judul: e.target.value })}
                placeholder="Judul kegiatan..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <textarea
                rows={2}
                value={newGal.deskripsi}
                onChange={(e) => setNewGal({ ...newGal, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newGal.judul.trim()) return;
                  addGalleryItem(newGal);
                  setNewGal({ judul: '', kua: 'KUA Jepara', tanggal: 'April 2026', deskripsi: '' });
                }}
                className="w-full py-1.5 rounded-lg bg-[#0F684E] text-white font-semibold"
              >
                + Tambah Kegiatan
              </button>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {data.gallery.map((g) => (
                  <div
                    key={g.id}
                    className="p-2 rounded-lg border border-slate-200 dark:border-emerald-950 flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium">{g.judul}</span>
                    <button
                      type="button"
                      onClick={() => deleteGalleryItem(g.id)}
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL (SUPERADMIN) */}
      {isSuper && activeTab === 'audit' && (() => {
        const q = auditSearch.trim().toLowerCase();
        const filteredLogs = data.auditLogs.filter(
          (log) =>
            !q ||
            log.actor.toLowerCase().includes(q) ||
            log.role.toLowerCase().includes(q) ||
            log.action.toLowerCase().includes(q)
        );
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">
                Audit Trail Aktivitas Petugas ({filteredLogs.length})
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Cari petugas, peran, aktivitas..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs"
                />
              </div>
            </div>
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[540px]">
                  <thead className="bg-[#F8FAF9] dark:bg-[#0D1613] border-b border-slate-200 dark:border-emerald-950">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Waktu</th>
                      <th className="text-left px-4 py-3 font-semibold">Petugas</th>
                      <th className="text-left px-4 py-3 font-semibold">Peran</th>
                      <th className="text-left px-4 py-3 font-semibold">Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-emerald-950">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          Tidak ada log aktivitas yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-2.5 font-mono-num text-slate-500 whitespace-nowrap">
                            {formatIndonesianDate(log.timestamp)}
                          </td>
                          <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{log.actor}</td>
                          <td className="px-4 py-2.5 text-[#0F684E] dark:text-emerald-400 font-semibold whitespace-nowrap">
                            {log.role}
                          </td>
                          <td className="px-4 py-2.5">{log.action}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Peserta Modal */}
      {editingPeserta && (
        <ModalDialog
          open={Boolean(editingPeserta)}
          onClose={() => setEditingPeserta(null)}
          title={`Sunting Data Peserta — ${editingPeserta.nama}`}
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePesertaByAdmin(editingPeserta.id, {
                nama: editingPeserta.nama,
                kua: editingPeserta.kua,
                desaTempatNikah: editingPeserta.desaTempatNikah,
                noHp: editingPeserta.noHp,
                password: editingPeserta.password,
              });
              setEditingPeserta(null);
            }}
            className="space-y-3.5 text-xs sm:text-sm"
          >
            <div>
              <label className="block font-semibold mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={editingPeserta.nama}
                onChange={(e) => setEditingPeserta({ ...editingPeserta, nama: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Unit KUA</label>
                <select
                  value={editingPeserta.kua}
                  onChange={(e) => {
                    const nextKua = e.target.value;
                    const firstDesa = (DESA_PER_KUA_JEPARA[nextKua] || [''])[0];
                    setEditingPeserta({
                      ...editingPeserta,
                      kua: nextKua,
                      desaTempatNikah: firstDesa,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                >
                  {LIST_16_KUA.map((kua) => (
                    <option key={kua} value={kua}>
                      {kua}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Desa Tempat Nikah</label>
                <select
                  value={editingPeserta.desaTempatNikah || ''}
                  onChange={(e) =>
                    setEditingPeserta({ ...editingPeserta, desaTempatNikah: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                >
                  {(DESA_PER_KUA_JEPARA[editingPeserta.kua] || []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={editingPeserta.noHp || ''}
                  onChange={(e) => setEditingPeserta({ ...editingPeserta, noHp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reset Kata Sandi</label>
                <input
                  type="text"
                  value={editingPeserta.password}
                  onChange={(e) =>
                    setEditingPeserta({ ...editingPeserta, password: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPeserta(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0F684E] text-white text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </ModalDialog>
      )}

      {/* Staff Account Modal */}
      <ModalDialog
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title={staffForm.id ? 'Sunting Akun Petugas' : 'Tambah Akun Admin KUA / Fasilitator'}
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStaffErr('');
            const res = saveStaffAccount(staffForm);
            if (!res.ok) setStaffErr(res.error || 'Gagal menyimpan akun.');
            else setStaffModalOpen(false);
          }}
          className="space-y-3.5 text-xs sm:text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Peran</label>
              <select
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, role: e.target.value as 'AdminKUA' | 'Fasilitator' })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              >
                <option value="Fasilitator">Fasilitator / Penyuluh KUA</option>
                <option value="AdminKUA">Admin / Operator KUA</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Unit KUA</label>
              <select
                value={staffForm.kua}
                onChange={(e) => setStaffForm({ ...staffForm, kua: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              >
                {LIST_16_KUA.map((kua) => (
                  <option key={kua} value={kua}>
                    {kua}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Nama Lengkap &amp; Gelar *</label>
              <input
                type="text"
                required
                value={staffForm.nama}
                onChange={(e) => setStaffForm({ ...staffForm, nama: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Username *</label>
              <input
                type="text"
                required
                value={staffForm.username}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, username: e.target.value.replace(/\s+/g, '') })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Kata Sandi *</label>
              <input
                type="text"
                required
                minLength={6}
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">NIP (Opsional)</label>
              <input
                type="text"
                value={staffForm.nip}
                onChange={(e) => setStaffForm({ ...staffForm, nip: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
              />
            </div>
          </div>
          {staffErr && <p className="text-xs text-red-600">{staffErr}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0F684E] text-white text-xs font-semibold"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </ModalDialog>

      {certPreviewUser && (
        <CertificatePreviewModal
          open={Boolean(certPreviewUser)}
          onClose={() => setCertPreviewUser(null)}
          user={certPreviewUser}
          pejabat={data.settings.pejabat}
        />
      )}

      <ExecutiveReportPreviewModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        report={executiveReport}
      />
    </WorkspaceShell>
  );
};
