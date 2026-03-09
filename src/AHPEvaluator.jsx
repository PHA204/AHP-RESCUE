import { useState, useMemo, useEffect, useRef } from "react";

// ── Dữ liệu tiêu chí ──────────────────────────────────────────────
const CRITERIA = [
  { key: "injury",    label: "Mức độ thương tích",         desc: "Nghiêm trọng → ưu tiên cao" },
  { key: "groupSize", label: "Số người trong nhóm",         desc: "Nhóm đông → ưu tiên cao" },
  { key: "access",    label: "Vị trí / khả năng tiếp cận", desc: "Khó tiếp cận → ưu tiên cao" },
  { key: "waitTime",  label: "Thời gian kêu cứu",           desc: "Chờ lâu → ưu tiên cao" },
];

const N = CRITERIA.length;

const SAATY = [
  { val: 1/9, label: "1/9" }, { val: 1/8, label: "1/8" },
  { val: 1/7, label: "1/7" }, { val: 1/6, label: "1/6" },
  { val: 1/5, label: "1/5" }, { val: 1/4, label: "1/4" },
  { val: 1/3, label: "1/3" }, { val: 1/2, label: "1/2" },
  { val: 1,   label: "1"   }, { val: 2,   label: "2"   },
  { val: 3,   label: "3"   }, { val: 4,   label: "4"   },
  { val: 5,   label: "5"   }, { val: 6,   label: "6"   },
  { val: 7,   label: "7"   }, { val: 8,   label: "8"   },
  { val: 9,   label: "9"   },
];

const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45];

function calcAHP(matrix) {
  const colSums = Array(N).fill(0);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) colSums[j] += matrix[i][j];
  const norm = matrix.map(row => row.map((v, j) => v / colSums[j]));
  const weights = norm.map(row => row.reduce((s, v) => s + v, 0) / N);
  const weighted = matrix.map((row, i) => row.reduce((s, v, j) => s + v * weights[j], 0));
  const lambdaMax = weighted.reduce((s, v, i) => s + v / weights[i], 0) / N;
  const CI = (lambdaMax - N) / (N - 1);
  const CR = CI / RI[N];
  return { weights, CR, consistent: CR < 0.1 };
}

function identityMatrix() {
  return Array.from({ length: N }, () => Array.from({ length: N }, () => 1));
}

function valToSlider(v) {
  let best = 0;
  SAATY.forEach((s, i) => { if (Math.abs(s.val - v) < Math.abs(SAATY[best].val - v)) best = i; });
  return best;
}

// ── Component chính ───────────────────────────────────────────────
export default function AHPEvaluator() {
  const [matrix, setMatrix] = useState(identityMatrix);
  const [victims, setVictims] = useState([
    { id: 1, name: "Nạn nhân A", injury: 7, groupSize: 3, access: 5, waitTime: 4, lat: 10.8231, lng: 106.6297 },
    { id: 2, name: "Nạn nhân B", injury: 4, groupSize: 8, access: 3, waitTime: 9, lat: 10.7769, lng: 106.7009 },
    { id: 3, name: "Nạn nhân C", injury: 9, groupSize: 2, access: 8, waitTime: 2, lat: 10.7950, lng: 106.6600 },
  ]);
  const [tab, setTab] = useState("matrix");

  const ahp = useMemo(() => calcAHP(matrix), [matrix]);

  const ranked = useMemo(() => {
    return victims.map(v => {
      const rawScores = CRITERIA.map(c => v[c.key]);
      const maxes = CRITERIA.map(c => Math.max(...victims.map(vv => vv[c.key])));
      const normScores = rawScores.map((s, i) => s / maxes[i]);
      const score = normScores.reduce((sum, s, i) => sum + s * ahp.weights[i], 0);
      return { ...v, score: Math.round(score * 1000) / 10 };
    }).sort((a, b) => b.score - a.score);
  }, [victims, ahp.weights]);

  function updateCell(i, j, sliderIdx) {
    const val = SAATY[sliderIdx].val;
    setMatrix(prev => {
      const m = prev.map(r => [...r]);
      m[i][j] = val;
      m[j][i] = Math.round((1 / val) * 1000) / 1000;
      return m;
    });
  }

  function updateCellByText(i, j, raw) {
    let val;
    if (/^\d+\/\d+$/.test(raw.trim())) {
      const [a, b] = raw.split("/").map(Number);
      val = b !== 0 ? a / b : null;
    } else {
      val = parseFloat(raw);
    }
    if (!val || isNaN(val) || val <= 0 || val > 9) return;
    updateCell(i, j, valToSlider(val));
  }

  function updateVictim(id, field, value) {
    const num = Math.min(10, Math.max(1, Number(value)));
    setVictims(prev => prev.map(v => v.id === id ? { ...v, [field]: isNaN(num) ? v[field] : num } : v));
  }

  function updateVictimCoord(id, field, value) {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setVictims(prev => prev.map(v => v.id === id ? { ...v, [field]: num } : v));
  }

  function addVictim() {
    const newId = Math.max(...victims.map(v => v.id)) + 1;
    setVictims(prev => [...prev, {
      id: newId, name: `Nạn nhân ${String.fromCharCode(64 + newId)}`,
      injury: 5, groupSize: 3, access: 5, waitTime: 5, lat: 10.8231, lng: 106.6297,
    }]);
  }

  function removeVictim(id) {
    if (victims.length <= 1) return;
    setVictims(prev => prev.filter(v => v.id !== id));
  }

  const priorityColor = (rank) => {
    if (rank === 0) return "#e53e3e";
    if (rank === 1) return "#dd6b20";
    if (rank === 2) return "#d69e2e";
    return "#38a169";
  };

  const priorityLabel = (rank) => {
    if (rank === 0) return "KHẨN CẤP";
    if (rank === 1) return "CAO";
    if (rank === 2) return "TRUNG BÌNH";
    return "THẤP";
  };

  // ── Map Tab ───────────────────────────────────────────────────────
  function MapTab({ ranked }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      function updateMarkers(L) {
        const map = mapInstanceRef.current;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        const colors = ["#e53e3e", "#dd6b20", "#d69e2e", "#38a169"];
        const labels = ["KHẨN CẤP", "CAO", "TRUNG BÌNH", "THẤP"];
        ranked.forEach((v, rank) => {
          const color = colors[Math.min(rank, 3)];
          const label = labels[Math.min(rank, 3)];
          const icon = L.divIcon({
            className: "",
            html: `<div style="background:${color};color:#fff;font-weight:900;font-size:13px;font-family:sans-serif;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
              <span style="transform:rotate(45deg)">#${rank + 1}</span></div>`,
            iconSize: [36, 36], iconAnchor: [18, 36],
          });
          const marker = L.marker([v.lat, v.lng], { icon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family:sans-serif;min-width:200px;padding:4px">
              <div style="font-size:17px;font-weight:800;color:${color};margin-bottom:6px">#${rank + 1} ${v.name}</div>
              <div style="display:inline-block;padding:3px 10px;border-radius:10px;background:${color}22;color:${color};border:1px solid ${color};font-size:12px;font-weight:700;margin-bottom:10px">${label}</div>
              <table style="font-size:14px;color:#333;width:100%;border-collapse:collapse">
                <tr><td style="padding:3px 0;color:#666">Thương tích</td><td style="font-weight:700;text-align:right">${v.injury}/10</td></tr>
                <tr><td style="padding:3px 0;color:#666">Số người</td><td style="font-weight:700;text-align:right">${v.groupSize}/10</td></tr>
                <tr><td style="padding:3px 0;color:#666">Tiếp cận</td><td style="font-weight:700;text-align:right">${v.access}/10</td></tr>
                <tr><td style="padding:3px 0;color:#666">Chờ đợi</td><td style="font-weight:700;text-align:right">${v.waitTime}/10</td></tr>
              </table>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid #eee;font-size:15px">
                Điểm AHP: <b style="color:${color};font-size:20px">${v.score.toFixed(1)}</b>
              </div>
            </div>`);
          markersRef.current.push(marker);
        });
        if (ranked.length > 0) {
          const bounds = L.latLngBounds(ranked.map(v => [v.lat, v.lng]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }

      function initMap(L) {
        if (mapInstanceRef.current) { updateMarkers(L); return; }
        const map = L.map(mapRef.current, { zoomControl: true }).setView([10.8231, 106.6297], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors", maxZoom: 19,
        }).addTo(map);
        mapInstanceRef.current = map;
        updateMarkers(L);
      }

      if (window.L) { initMap(window.L); }
      else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => initMap(window.L);
        document.head.appendChild(script);
      }
    }, [ranked]);

    return (
      <div>
        <p style={s.desc}>Vị trí nạn nhân trên bản đồ. Marker đỏ = khẩn cấp nhất. Nhấn vào marker để xem chi tiết.</p>
        <div style={s.legend}>
          {[["#e53e3e","KHẨN CẤP"],["#dd6b20","CAO"],["#d69e2e","TRUNG BÌNH"],["#38a169","THẤP"]].map(([c,l]) => (
            <div key={l} style={s.legendItem}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              <span style={{ fontSize: 14, color: "#4a5568", fontWeight: 600 }}>{l}</span>
            </div>
          ))}
        </div>
        <div ref={mapRef} style={s.mapBox} />
        <div style={{ marginTop: 24 }}>
          <p style={{ ...s.desc, marginBottom: 14, fontWeight: 600, color: "#2d3748" }}>Chỉnh tọa độ nạn nhân:</p>
          <div style={s.coordGrid}>
            {ranked.map((v, rank) => {
              const color = priorityColor(rank);
              return (
                <div key={v.id} style={{ ...s.coordCard, borderLeft: `4px solid ${color}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color }}>#{rank+1} {v.name}</div>
                  <div style={s.coordRow}>
                    <label style={s.coordLabel}>Vĩ độ (lat)</label>
                    <input type="number" step="0.0001" value={v.lat}
                      onChange={e => updateVictimCoord(v.id, "lat", e.target.value)}
                      style={s.coordInput} />
                  </div>
                  <div style={s.coordRow}>
                    <label style={s.coordLabel}>Kinh độ (lng)</label>
                    <input type="number" step="0.0001" value={v.lng}
                      onChange={e => updateVictimCoord(v.id, "lng", e.target.value)}
                      style={s.coordInput} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.title}>HỆ THỐNG PHÂN CẤP CỨU NẠN</h1>
            <p style={s.subtitle}>Phân tích thứ bậc AHP · Điều phối cứu hộ thông minh</p>
          </div>
          <div style={{
            ...s.crBadge,
            background: ahp.consistent ? "#f0fff4" : "#fff5f5",
            borderColor: ahp.consistent ? "#38a169" : "#e53e3e",
          }}>
            <span style={{ color: ahp.consistent ? "#276749" : "#c53030", fontSize: 15, fontWeight: 700 }}>
              CR = {(ahp.CR * 100).toFixed(1)}%
            </span>
            <span style={{ color: ahp.consistent ? "#276749" : "#c53030", fontSize: 13, marginTop: 2 }}>
              {ahp.consistent ? "✓ Nhất quán" : "✗ Cần chỉnh lại"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {[
          { key: "matrix",  label: "Ma trận AHP" },
          { key: "weights", label: "Trọng số" },
          { key: "victims", label: "Nạn nhân" },
          { key: "result",  label: "Kết quả ưu tiên" },
          { key: "map",     label: "Bản đồ" },
        ].map(t => (
          <button key={t.key}
            style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.content}>

        {/* Tab 1: Ma trận */}
        {tab === "matrix" && (
          <div>
            <p style={s.desc}>So sánh từng cặp tiêu chí theo thang Saaty 1–9. Kéo thanh trượt hoặc gõ trực tiếp (ví dụ: 3, 1/3).</p>
            <div style={s.matrixGrid}>
              <div style={s.matrixCorner} />
              {CRITERIA.map(c => (
                <div key={c.key} style={s.matrixColHead}>
                  <span style={s.matrixHeadLabel}>{c.label}</span>
                </div>
              ))}
              {CRITERIA.map((ci, i) => (
                <>
                  <div key={`rh-${i}`} style={s.matrixRowHead}>
                    <span style={s.matrixHeadLabel}>{ci.label}</span>
                  </div>
                  {CRITERIA.map((cj, j) => {
                    const isDiag = i === j;
                    const isUpper = i < j;
                    const val = matrix[i][j];
                    const sIdx = valToSlider(val);
                    const label = SAATY[sIdx].label;
                    return (
                      <div key={`${i}-${j}`} style={{
                        ...s.matrixCell,
                        background: isDiag ? "#f0fff4" : isUpper ? "#ebf8ff" : "#fff5f5",
                      }}>
                        {isDiag ? (
                          <span style={{ color: "#a0aec0", fontSize: 24 }}>—</span>
                        ) : (
                          <div style={s.cellInner}>
                            <span style={{ ...s.cellValue, color: isUpper ? "#2b6cb0" : "#c53030" }}>
                              {label}
                            </span>
                            {isUpper && (
                              <>
                                <input type="range" min={0} max={SAATY.length - 1} step={1}
                                  value={sIdx}
                                  onChange={e => updateCell(i, j, Number(e.target.value))}
                                  style={s.slider} />
                                <input type="text"
                                  defaultValue={label} key={label}
                                  onBlur={e => updateCellByText(i, j, e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && updateCellByText(i, j, e.target.value)}
                                  placeholder="vd: 3"
                                  style={s.cellNumInput} />
                              </>
                            )}
                            {!isUpper && (
                              <span style={s.mirrorLabel}>tự động</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Trọng số */}
        {tab === "weights" && (
          <div>
            <p style={s.desc}>Trọng số từng tiêu chí được tính tự động từ ma trận so sánh cặp AHP.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CRITERIA.map((c, i) => {
                const pct = (ahp.weights[i] * 100).toFixed(1);
                return (
                  <div key={c.key} style={s.weightCard}>
                    <div style={s.weightTop}>
                      <div>
                        <div style={s.weightLabel}>{c.label}</div>
                        <div style={s.weightDesc}>{c.desc}</div>
                      </div>
                      <div style={s.weightPct}>{pct}%</div>
                    </div>
                    <div style={s.barBg}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: "linear-gradient(90deg, #e53e3e, #dd6b20)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={s.totalRow}>
              <span style={{ color: "#718096", fontSize: 15 }}>Tổng trọng số:</span>
              <span style={{ color: "#276749", fontWeight: 700, fontSize: 16 }}>
                {(ahp.weights.reduce((a, w) => a + w, 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Nạn nhân */}
        {tab === "victims" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <p style={s.desc}>Nhập thông tin từng nạn nhân. Điểm từ 1 đến 10.</p>
              <button style={s.addBtn} onClick={addVictim}>+ Thêm nạn nhân</button>
            </div>
            {victims.map(v => (
              <div key={v.id} style={s.victimCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <input value={v.name}
                    onChange={e => updateVictim(v.id, "name", e.target.value)}
                    style={s.victimNameInput} />
                  <button style={s.removeBtn} onClick={() => removeVictim(v.id)}>Xóa</button>
                </div>
                <div style={s.victimFields}>
                  {CRITERIA.map(c => (
                    <div key={c.key} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <label style={s.fieldLabel}>{c.label}</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="range" min={1} max={10} step={1}
                          value={v[c.key]}
                          onChange={e => updateVictim(v.id, c.key, e.target.value)}
                          style={s.fieldSlider} />
                        <input type="number" min={1} max={10} step={1}
                          value={v[c.key]}
                          onChange={e => updateVictim(v.id, c.key, e.target.value)}
                          style={s.fieldNumInput} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Kết quả */}
        {tab === "result" && (
          <div>
            <p style={s.desc}>Thứ tự ưu tiên cứu hộ dựa trên trọng số AHP và điểm từng nạn nhân.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ranked.map((v, rank) => {
                const color = priorityColor(rank);
                return (
                  <div key={v.id} style={{ ...s.resultCard, borderLeft: `5px solid ${color}` }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80 }}>
                      <span style={{ fontSize: 38, fontWeight: 900, color, lineHeight: 1 }}>#{rank + 1}</span>
                      <span style={{
                        padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: color + "18", color, border: `1px solid ${color}`,
                      }}>{priorityLabel(rank)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#1a202c" }}>{v.name}</div>
                      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                        {CRITERIA.map(c => (
                          <span key={c.key} style={{ fontSize: 14, color: "#718096" }}>
                            {c.label}: <b style={{ color: "#2d3748" }}>{v[c.key]}</b>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 90 }}>
                      <div style={{ fontSize: 38, fontWeight: 900, color, lineHeight: 1 }}>{v.score.toFixed(1)}</div>
                      <div style={{ fontSize: 13, color: "#718096", margin: "4px 0 8px" }}>điểm</div>
                      <div style={{ height: 6, background: "#edf2f7", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${v.score}%`, background: color, borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={s.weightReminder}>
              <span style={{ fontSize: 14, color: "#718096", fontWeight: 600 }}>Trọng số hiện tại:</span>
              {CRITERIA.map((c, i) => (
                <span key={c.key} style={{ fontSize: 14, color: "#4a5568" }}>
                  {c.label} <b style={{ color: "#dd6b20" }}>{(ahp.weights[i] * 100).toFixed(0)}%</b>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Bản đồ */}
        {tab === "map" && <MapTab ranked={ranked} />}

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = {
  root: {
    minHeight: "100vh",
    background: "#f0f4f8",
    color: "#1a202c",
    fontFamily: "'Segoe UI', 'Arial', sans-serif",
    fontSize: 15,
  },
  header: {
    background: "linear-gradient(135deg, #ffffff 0%, #fff5f5 60%, #fff8f0 100%)",
    borderBottom: "1px solid #e2e8f0",
    padding: "22px 36px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  headerInner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    maxWidth: 1140, margin: "0 auto",
  },
  title: {
    margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: 1.5,
    background: "linear-gradient(90deg, #e53e3e, #dd6b20)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { margin: "5px 0 0", fontSize: 14, color: "#718096" },
  crBadge: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "12px 22px", borderRadius: 10, border: "1px solid",
  },
  tabBar: {
    display: "flex",
    background: "#ffffff",
    borderBottom: "2px solid #e2e8f0",
    maxWidth: 1140, margin: "0 auto",
    padding: "0 36px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  tab: {
    padding: "16px 24px", background: "transparent", border: "none",
    color: "#718096", cursor: "pointer", fontSize: 15, fontWeight: 500,
    borderBottom: "3px solid transparent", transition: "all 0.2s",
  },
  tabActive: {
    color: "#dd6b20", borderBottom: "3px solid #dd6b20", fontWeight: 700,
  },
  content: {
    maxWidth: 1140, margin: "0 auto",
    padding: "32px 36px",
  },
  desc: { color: "#718096", fontSize: 14, marginBottom: 24, lineHeight: 1.7 },

  // Matrix
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: `210px repeat(${N}, 1fr)`,
    gap: 3,
  },
  matrixCorner: { background: "transparent" },
  matrixColHead: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "12px 8px", background: "#e8edf2", borderRadius: 6,
  },
  matrixRowHead: {
    display: "flex", alignItems: "center",
    padding: "12px 14px", background: "#e8edf2", borderRadius: 6,
  },
  matrixHeadLabel: { fontSize: 13, color: "#2d3748", textAlign: "center", lineHeight: 1.4, fontWeight: 600 },
  matrixCell: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "14px 8px", borderRadius: 6, minHeight: 82,
  },
  cellInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: "100%" },
  cellValue: { fontSize: 22, fontWeight: 800 },
  mirrorLabel: { fontSize: 12, color: "#a0aec0" },
  slider: { width: "88%", accentColor: "#3182ce", cursor: "pointer" },
  cellNumInput: {
    width: 68, background: "#ffffff", border: "1px solid #bee3f8",
    color: "#2b6cb0", fontSize: 13, fontWeight: 700,
    borderRadius: 5, padding: "4px 6px", textAlign: "center", outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },

  // Weights
  weightCard: {
    background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  weightTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  weightLabel: { fontSize: 16, fontWeight: 700, color: "#1a202c" },
  weightDesc: { fontSize: 13, color: "#718096", marginTop: 3 },
  weightPct: { fontSize: 32, fontWeight: 800, color: "#dd6b20" },
  barBg: { height: 10, background: "#edf2f7", borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5, transition: "width 0.5s ease" },
  totalRow: {
    display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12,
    marginTop: 18, paddingTop: 16, borderTop: "1px solid #e2e8f0",
  },

  // Victims
  addBtn: {
    padding: "10px 20px", background: "#f0fff4", border: "1px solid #38a169",
    color: "#276749", borderRadius: 7, cursor: "pointer", fontSize: 14,
    fontWeight: 600, whiteSpace: "nowrap",
  },
  victimCard: {
    background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: "18px 22px", marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  victimNameInput: {
    background: "transparent", border: "none", borderBottom: "2px solid #cbd5e0",
    color: "#1a202c", fontSize: 18, fontWeight: 700,
    outline: "none", paddingBottom: 4, width: "80%",
  },
  removeBtn: {
    background: "#fff5f5", border: "1px solid #fed7d7", color: "#e53e3e",
    borderRadius: 6, cursor: "pointer", padding: "6px 14px", fontSize: 13, fontWeight: 600,
  },
  victimFields: {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px 28px",
  },
  fieldLabel: { fontSize: 14, color: "#4a5568", fontWeight: 600 },
  fieldSlider: { flex: 1, accentColor: "#dd6b20", cursor: "pointer" },
  fieldNumInput: {
    width: 56, background: "#fffaf0", border: "1px solid #fbd38d",
    color: "#c05621", fontSize: 16, fontWeight: 700,
    borderRadius: 5, padding: "4px 6px", textAlign: "center", outline: "none",
    MozAppearance: "textfield",
  },

  // Results
  resultCard: {
    display: "flex", alignItems: "center", gap: 22,
    background: "#ffffff", borderRadius: 10, padding: "20px 24px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  },
  weightReminder: {
    display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    marginTop: 24, padding: "14px 20px",
    background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 8,
  },

  // Map
  mapBox: {
    height: 480, borderRadius: 12, overflow: "hidden",
    border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  legend: { display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 8 },
  coordGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14,
  },
  coordCard: {
    background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8,
    padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  coordRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  coordLabel: { fontSize: 13, color: "#718096", fontWeight: 500 },
  coordInput: {
    width: 120, background: "#f7fafc", border: "1px solid #cbd5e0",
    color: "#2d3748", fontSize: 13,
    borderRadius: 5, padding: "4px 8px", outline: "none", textAlign: "right",
  },
};