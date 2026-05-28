import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function ChatBot() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/ai-analytics')) {
    return null;
  }

  return (
    <button
      className="chatbot-fab"
      onClick={() => navigate('/ai-analytics')}
      aria-label="Open Insights AI"
      title="Ask Insights AI"
    >
      <Sparkles size={24} />
      <span className="chatbot-fab-badge">AI</span>
    </button>
  );
}
