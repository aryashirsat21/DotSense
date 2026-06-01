import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateAdminReport({ classData, errorPatterns, weekData }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background: #ffffff;
          color: #1a1a2e;
          padding: 40px;
        }
        .header {
          background: linear-gradient(135deg, #6c63ff, #8b84ff);
          color: white;
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 32px;
        }
        .app-name {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 8px;
        }
        .class-name {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .period {
          font-size: 14px;
          opacity: 0.8;
        }
        .stats-row {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          flex: 1;
          background: #f8f8ff;
          border: 1px solid #e0e0ff;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .stat-num {
          font-size: 32px;
          font-weight: 800;
          color: #6c63ff;
          margin-bottom: 4px;
        }
        .stat-num.green  { color: #43e97b; }
        .stat-num.orange { color: #f7971e; }
        .stat-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        .section {
          background: #f8f8ff;
          border: 1px solid #e0e0ff;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 20px;
        }
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 120px;
          margin-bottom: 8px;
        }
        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }
        .bar-score {
          font-size: 11px;
          font-weight: 700;
          color: #6c63ff;
        }
        .bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          background: linear-gradient(to top, #6c63ff88, #6c63ff);
        }
        .bar-label {
          font-size: 10px;
          color: #999;
        }
        .error-row {
          margin-bottom: 16px;
        }
        .error-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .error-label { font-size: 13px; color: #333; }
        .error-pct   { font-size: 13px; font-weight: 700; }
        .error-bar-bg {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        .error-bar-fill {
          height: 100%;
          border-radius: 4px;
        }
        .privacy-box {
          background: #f0fff4;
          border: 1px solid #43e97b55;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .privacy-title {
          font-size: 13px;
          font-weight: 700;
          color: #2d7a4f;
          margin-bottom: 6px;
        }
        .privacy-text {
          font-size: 12px;
          color: #555;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #999;
        }
        .footer strong { color: #6c63ff; }
      </style>
    </head>
    <body>

      <div class="header">
        <div class="app-name">DotSense — Admin Report</div>
        <div class="class-name">${classData.className}</div>
        <div class="period">${classData.period}</div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num green">${classData.avgScore}%</div>
          <div class="stat-label">Class Average</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${classData.improvement}</div>
          <div class="stat-label">vs Last Week</div>
        </div>
        <div class="stat-card">
          <div class="stat-num orange">${classData.needSupport}</div>
          <div class="stat-label">Need Support</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${classData.totalScans}</div>
          <div class="stat-label">Total Scans</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📈 Class Progress — Last 6 Weeks</div>
        <div class="bar-chart">
          ${weekData.scores.map((score, i) => {
            const h = Math.round((score / 100) * 100);
            const color = score >= 80 ? '#43e97b' : score >= 65 ? '#f7971e' : '#ff6584';
            return `
              <div class="bar-group">
                <div class="bar-score" style="color:${color}">${score}%</div>
                <div class="bar" style="height:${h}px; background:${color}"></div>
                <div class="bar-label">${weekData.labels[i]}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-title">⚠️ Common Error Patterns (Class-wide)</div>
        ${errorPatterns.map(e => `
          <div class="error-row">
            <div class="error-header">
              <span class="error-label">${e.label}</span>
              <span class="error-pct" style="color:${e.color}">${e.pct}% of class</span>
            </div>
            <div class="error-bar-bg">
              <div class="error-bar-fill" style="width:${e.pct}%; background:${e.color}"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="privacy-box">
        <div class="privacy-title">🔒 Privacy Protected</div>
        <div class="privacy-text">
          This report contains only aggregate class-level data.
          No individual student names, scores, or identifying information is included.
          This document is safe to share with school administration and management.
        </div>
      </div>

      <div class="footer">
        Generated by <strong>DotSense</strong> — Braille Teacher Assistant<br>
        ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
      </div>

    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Admin Report',
        UTI: 'com.adobe.pdf',
      });
    }
    return { success: true, uri };
  } catch (err) {
    console.warn('PDF generation failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function generateStudentReport({ student, words, wordStates, note, score }) {
  const correct = Object.values(wordStates).filter(s => s === 'correct').length;
  const errors  = Object.values(wordStates).filter(s => s === 'error').length;
  const partial = Object.values(wordStates).filter(s => s === 'partial').length;
  const scoreColor = score >= 80 ? '#43e97b' : score >= 65 ? '#f7971e' : '#ff6584';

  const wordChips = words.map((word, i) => {
    const state = wordStates[i] || 'correct';
    const bg    = state==='correct' ? '#e8fff2' : state==='error' ? '#fff0f3' : '#fff8ee';
    const color = state==='correct' ? '#2d7a4f' : state==='error' ? '#c0392b' : '#b7621a';
    const border= state==='correct' ? '#43e97b' : state==='error' ? '#ff6584' : '#f7971e';
    return `<span style="display:inline-block;background:${bg};color:${color};border:1.5px solid ${border};border-radius:6px;padding:4px 10px;margin:3px;font-size:12px;font-weight:600">${word}</span>`;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; padding: 40px; }
        .header { background: linear-gradient(135deg, #6c63ff, #8b84ff); color: white; padding: 28px; border-radius: 16px; margin-bottom: 28px; }
        .app-name { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8; margin-bottom: 6px; }
        .title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .subtitle { font-size: 13px; opacity: 0.8; }
        .score-section { display: flex; align-items: center; gap: 24px; background: #f8f8ff; border: 1px solid #e0e0ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .score-circle { width: 80px; height: 80px; border-radius: 50%; border: 4px solid ${scoreColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .score-num { font-size: 22px; font-weight: 800; color: ${scoreColor}; }
        .score-label { font-size: 9px; color: #999; }
        .score-details { flex: 1; }
        .score-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
        .section { background: #f8f8ff; border: 1px solid #e0e0ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .section-title { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; }
        .words-wrap { line-height: 2; }
        .note-text { font-size: 13px; color: #555; line-height: 1.7; font-style: italic; }
        .privacy-box { background: #f0fff4; border: 1px solid #43e97b55; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 12px; color: #555; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="app-name">DotSense — Internal Record</div>
        <div class="title">${student.name}</div>
        <div class="subtitle">${student.grade} • ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
      </div>

      <div class="score-section">
        <div class="score-circle">
          <div class="score-num">${score}%</div>
          <div class="score-label">SCORE</div>
        </div>
        <div class="score-details">
          <div class="score-row"><span style="color:#666">Total words</span><span style="font-weight:700">${words.length}</span></div>
          <div class="score-row"><span style="color:#666">Correct</span><span style="font-weight:700;color:#43e97b">${correct} ✓</span></div>
          <div class="score-row"><span style="color:#666">Errors</span><span style="font-weight:700;color:#ff6584">${errors} ✗</span></div>
          <div class="score-row"><span style="color:#666">Partial</span><span style="font-weight:700;color:#f7971e">${partial} ⚠</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Homework Words</div>
        <div class="words-wrap">${wordChips}</div>
      </div>

      ${note ? `
      <div class="section">
        <div class="section-title">🔒 Teacher's Private Note</div>
        <div class="note-text">${note}</div>
      </div>
      ` : ''}

      <div class="privacy-box">
        🔒 <strong>Internal use only.</strong> This document is for teacher reference only and should not be shared with students, parents, or external parties.
      </div>

      <div class="footer">
        Generated by <strong style="color:#6c63ff">DotSense</strong> — Braille Teacher Assistant
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Internal Record',
        UTI: 'com.adobe.pdf',
      });
    }
    return { success: true, uri };
  } catch (err) {
    console.warn('PDF generation failed:', err.message);
    return { success: false, error: err.message };
  }
}