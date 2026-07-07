import { useState } from 'react';
import api from '../service/api';

const STEPS = { UPLOAD: 'upload', QUESTION: 'question', ANSWERING: 'answering', RESULT: 'result' };

export default function MockInterviewPanel({ onBack }) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [cvFile, setCvFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [warn, setWarn] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);


  // Bước 1: Upload CV → nhận câu hỏi
  const handleStart = async () => {
    if (!cvFile) return;
    setLoading(true); setWarn('');
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      const res = await api.post('/ai/interview/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestion(res.data.data.question);
      setSessionId(res.data.data.sessionId);
      setStep(STEPS.QUESTION);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể phân tích CV. Vui lòng thử lại!';
      setWarn(msg);
      console.error('[MockInterview] Lỗi start:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };


  // Bước 2: Gửi câu trả lời → kiểm tra → đánh giá
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true); setWarn('');
    try {
      const res = await api.post('/ai/interview/answer', { sessionId, question, answer });
      if (res.data.data.status === 'OFF_TOPIC') {
        setWarn(res.data.data.reason || 'Câu trả lời lạc chủ đề, vui lòng trả lời lại!');
        setLoading(false);
        return;
      }
      setEvaluation(res.data.data.evaluation);
      setStep(STEPS.RESULT);
    } catch {
      setWarn('Lỗi hệ thống, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(STEPS.UPLOAD); setCvFile(null);
    setQuestion(''); setSessionId(null);
    setAnswer(''); setEvaluation(''); setWarn('');
  };

  const handleDontKnow = async () => {
    setLoading(true); setWarn('');
    try {
      const res = await api.post('/ai/interview/generate-answer', { sessionId, question });
      setAnswer(res.data.data.answer);
      setEvaluation('');
      setAiGenerated(true);
      setStep(STEPS.RESULT);
    } catch {
      setWarn('Không thể tạo câu trả lời. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };


  // ── Step dots ──
  const stepLabels = ['Tải CV', 'Câu hỏi', 'Trả lời', 'Kết quả'];
  const stepKeys   = [STEPS.UPLOAD, STEPS.QUESTION, STEPS.ANSWERING, STEPS.RESULT];
  const currentIdx = stepKeys.indexOf(step);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        {stepLabels.map((label, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#00b14f' : active ? '#ed1b2f' : '#e5e5e5',
                  color: (done || active) ? '#fff' : '#999',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: active ? '#ed1b2f' : done ? '#00b14f' : '#aaa', fontWeight: 600 }}>
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div style={{ width: 28, height: 2, background: done ? '#00b14f' : '#e5e5e5', marginBottom: 14, flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Warning */}
      {warn && (
        <div style={{
          background: '#fff4e5', border: '1px solid #ff9100', borderLeft: '4px solid #ff9100',
          borderRadius: 6, padding: '10px 14px', color: '#bf6c00', fontSize: 13, lineHeight: 1.5,
        }}>
          ⚠️ {warn}
        </div>
      )}

      {/* BƯỚC 1: UPLOAD */}
      {step === STEPS.UPLOAD && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, border: `2px dashed ${cvFile ? '#00b14f' : '#d0d0d0'}`,
            borderRadius: 10, padding: '28px 16px', cursor: 'pointer', textAlign: 'center',
            background: cvFile ? '#f0faf5' : '#fafafa', transition: '0.2s',
          }}>
            <span style={{ fontSize: 28 }}>{cvFile ? '📄' : '⬆️'}</span>
            {cvFile ? (
              <>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#121212' }}>{cvFile.name}</span>
                <span style={{ fontSize: 12, color: '#767676' }}>{(cvFile.size / 1024).toFixed(0)} KB — bấm để đổi file</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#4a4a4a' }}>Bấm để tải CV lên</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>PDF hoặc DOCX, tối đa 5MB</span>
              </>
            )}
            <input type="file" accept=".pdf,.docx" style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f && f.size > 5 * 1024 * 1024) { setWarn('File quá lớn! Tối đa 5MB.'); return; }
                setCvFile(f || null); setWarn('');
              }} />
          </label>
          <PanelBtn disabled={!cvFile || loading} onClick={handleStart} loading={loading}>
            🎙 Bắt đầu phỏng vấn
          </PanelBtn>
        </div>
      )}

      {/* BƯỚC 2: CÂU HỎI */}
      {step === STEPS.QUESTION && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>AI hỏi:</FieldLabel>
          <QuestionBox>{question}</QuestionBox>
          <PanelBtn onClick={() => setStep(STEPS.ANSWERING)}>✍️ Trả lời câu hỏi này</PanelBtn>
        </div>
      )}

      {/* BƯỚC 3: TRẢ LỜI */}
      {step === STEPS.ANSWERING && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Câu hỏi:</FieldLabel>
          <QuestionBox compact>{question}</QuestionBox>
          <FieldLabel>Câu trả lời của bạn:</FieldLabel>
          <textarea
            style={{
              width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
              border: '1px solid #e5e5e5', borderRadius: 8, resize: 'vertical',
              outline: 'none', boxSizing: 'border-box', color: '#121212',
            }}
            rows={5}
            placeholder="Nhập câu trả lời của bạn..."
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setWarn(''); }}
            onFocus={(e) => e.target.style.borderColor = '#ed1b2f'}
            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(STEPS.QUESTION)} style={{
              flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, color: '#767676',
            }}>← Xem lại</button>

            <button onClick={handleDontKnow} disabled={loading} style={{
              padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              background: '#fff', border: '1px dashed #d0d0d0', borderRadius: 8, color: '#767676',
            }}>
              🤖 Tôi không biết, để AI trả lời giúp
            </button>
            <PanelBtn style={{ flex: 2 }} disabled={!answer.trim() || loading} onClick={handleSubmit} loading={loading}>
              Gửi câu trả lời →
            </PanelBtn>
          </div>
        </div>
      )}

      {/* BƯỚC 4: KẾT QUẢ */}
      {step === STEPS.RESULT && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#00b14f' }}>
          {aiGenerated ? '🤖 Trợ lý AI đã trả lời giúp bạn' : '✅ Đánh giá của AI'}
        </div>
        <QuestionBox compact><strong>Câu hỏi:</strong> {question}</QuestionBox>

        <div style={{
          background: aiGenerated ? '#eef4ff' : '#f5f5f5',
          border: aiGenerated ? '1px solid #a9c6ff' : 'none',
          borderRadius: 8, padding: '12px 14px',
          fontSize: 13, color: '#4a4a4a', lineHeight: 1.6,
        }}>
          <strong>{aiGenerated ? 'Câu trả lời của Trợ lý AI:' : 'Câu trả lời của bạn:'}</strong>
          <p style={{ margin: '6px 0 0' }}>{answer}</p>
        </div>

        {!aiGenerated && (
          <div style={{
            background: '#e6f7ef', border: '1px solid #00b14f', borderLeft: '4px solid #00b14f',
            borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#005c28',
            lineHeight: 1.7, whiteSpace: 'pre-line',
          }}>
            {evaluation}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} style={{
            flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, color: '#767676',
          }}>← CV khác</button>
          <PanelBtn style={{ flex: 2 }} onClick={() => {
            setAnswer(''); setEvaluation(''); setWarn(''); setAiGenerated(false); setStep(STEPS.QUESTION);
          }}>
            Câu tiếp theo →
          </PanelBtn>
        </div>
      </div>
    )}
    </div>
  );
}

// ── Sub-components nhỏ ───────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#767676' }}>
      {children}
    </div>
  );
}

function QuestionBox({ children, compact }) {
  return (
    <div style={{
      background: '#fff8f8', border: '1px solid #f5c6c6', borderLeft: '4px solid #ed1b2f',
      borderRadius: 8, padding: compact ? '12px 14px' : '16px',
      fontSize: compact ? 13 : 14, fontWeight: 500, color: '#121212', lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

function PanelBtn({ children, disabled, onClick, loading, style }) {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        padding: '12px 16px', background: disabled ? '#d6d6d6' : '#ed1b2f',
        color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', transition: '0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        ...style,
      }}
    >
      {loading
        ? <span style={{
            width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'mi-spin 0.7s linear infinite', display: 'inline-block',
          }} />
        : children}
    </button>
  );
}