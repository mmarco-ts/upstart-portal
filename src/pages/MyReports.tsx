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

async function searchLiveboards(): Promise<MetadataItem[]> {
  const res = await fetch(`${TS_HOST}/api/rest/2.0/metadata/search`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      metadata: [{ type: 'LIVEBOARD' }],
      record_size: 50,
      sort_options: { field_name: 'MODIFIED', order: 'DESC' },
    }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data || data.items || [];
  return list.map((row: any) => ({
    id: row.metadata_id || row.id,
    name: row.metadata_name || row.name || 'Untitled',
    description: row.metadata_header?.description || row.description,
    type: row.metadata_type || row.type || 'LIVEBOARD',
    modified: row.metadata_header?.modified || row.modified,
    author: row.metadata_header?.authorName || row.author_name,
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
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    searchLiveboards()
      .then(setItems)
      .catch(e => setError(e.message || 'Failed to load reports'))
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
              <div>
                <div className="reports-error-title">Couldn't load reports</div>
                <div className="reports-error-body">{error}. Make sure you're signed in to {TS_HOST}.</div>
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
