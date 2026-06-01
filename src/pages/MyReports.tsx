import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, RefreshCw, Search, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { TS_HOST } from '../lib/thoughtspot';

interface MetadataItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  modified?: number;
  author?: string;
}

class ApiError extends Error {
  status: number;
  bodySnippet?: string;
  constructor(message: string, status: number, bodySnippet?: string) {
    super(message);
    this.status = status;
    this.bodySnippet = bodySnippet;
  }
}

async function searchLiveboards(): Promise<MetadataItem[]> {
  let res: Response;
  try {
    res = await fetch(`${TS_HOST}/api/rest/2.0/metadata/search`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        metadata: [{ type: 'LIVEBOARD' }],
        record_size: 100,
        sort_options: { field_name: 'MODIFIED', order: 'DESC' },
      }),
    });
  } catch (e: any) {
    // Network-level failure — usually CORS blocked or host unreachable.
    throw new ApiError(
      `Network error talking to ${TS_HOST}. Likely cause: CORS not whitelisted for this origin, or you're not signed in to ThoughtSpot in this browser.`,
      0,
      e?.message,
    );
  }

  if (!res.ok) {
    let snippet = '';
    try { snippet = (await res.text()).slice(0, 240); } catch {}
    if (res.status === 401 || res.status === 403) {
      throw new ApiError(
        `Not signed in to ThoughtSpot. Open ${TS_HOST} in another tab, sign in, then refresh this page.`,
        res.status,
        snippet,
      );
    }
    throw new ApiError(`Search failed (HTTP ${res.status}).`, res.status, snippet);
  }

  const data = await res.json();
  // The v2 metadata/search response is a flat array. Older shapes are tolerated.
  const list: any[] = Array.isArray(data)
    ? data
    : data.data || data.items || data.results || [];

  return list.map((row: any): MetadataItem => ({
    id: row.metadata_id || row.id || row.guid || '',
    name: row.metadata_name || row.name || 'Untitled',
    description:
      row.metadata_header?.description ||
      row.description ||
      row.metadata_description ||
      '',
    type: row.metadata_type || row.type || 'LIVEBOARD',
    modified: row.metadata_header?.modified || row.modified || row.modified_time,
    author:
      row.metadata_header?.authorName ||
      row.author_name ||
      row.metadata_header?.author ||
      row.author,
  }));
}

function formatDate(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyReports() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    searchLiveboards()
      .then(setItems)
      .catch((e: any) => {
        if (e instanceof ApiError) setError(e);
        else setError(new ApiError(e?.message || 'Failed to load reports', 0));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = query
    ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <>
      <Header
        title="My Reports"
        subtitle="Every liveboard you can access — pulled live from Upstart Insights"
      />
      <main className="main-content">
        <div className="page-container">
          <div className="reports-toolbar">
            <div className="reports-search">
              <Search size={16} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter reports…"
              />
            </div>
            <button className="reports-refresh" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="reports-error">
              <AlertCircle size={18} />
              <div style={{ flex: 1 }}>
                <div className="reports-error-title">Couldn't load reports</div>
                <div className="reports-error-body">{error.message}</div>
                {error.bodySnippet && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 11 }}>Response detail</summary>
                    <pre style={{
                      marginTop: 6,
                      padding: 8,
                      background: '#fff',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      fontSize: 11,
                      overflow: 'auto',
                      maxHeight: 120,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {error.bodySnippet}
                    </pre>
                  </details>
                )}
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <a
                    href={TS_HOST}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      background: '#06182c',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Open ThoughtSpot to sign in <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={load}
                    style={{
                      padding: '6px 12px',
                      background: '#fff',
                      color: '#06182c',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {!error && !loading && filtered.length === 0 && (
            <div className="reports-empty">No reports found.</div>
          )}

          <div className="reports-grid">
            {filtered.map(item => (
              <button
                key={item.id}
                className="report-card"
                onClick={() => navigate(`/dashboard/${item.id}`)}
              >
                <div className="report-card-icon"><FileText size={20} /></div>
                <div className="report-card-body">
                  <div className="report-card-title">{item.name}</div>
                  {item.description && <div className="report-card-desc">{item.description}</div>}
                  <div className="report-card-meta">
                    {item.author && <span>{item.author}</span>}
                    {item.author && item.modified && <span> · </span>}
                    {item.modified && <span>Modified {formatDate(item.modified)}</span>}
                  </div>
                </div>
                <ExternalLink size={14} className="report-card-arrow" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
