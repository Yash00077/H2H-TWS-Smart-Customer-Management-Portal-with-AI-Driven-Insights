import { useState } from 'react';
import { queryAI } from '../api/client';
import { MessageSquare, Send, Bot, User, ChevronRight, AlertCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

function AIChat() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I can help you analyze your customer data. Try asking "Show customers with high churn risk in Europe".' }
  ]);
  const [lastResults, setLastResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query };
    setMessages([...messages, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await queryAI(query);
      const botMsg = { 
        role: 'bot', 
        text: `I've found ${res.data.results.length} customers matching your request.`,
        filters: res.data.filters,
        results: res.data.results
      };
      setMessages(prev => [...prev, botMsg]);
      setLastResults(res.data.results);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
      {/* Chat Area */}
      <div className="lg:col-span-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-blue-50 text-blue-700">
          <Bot size={20} className="mr-2" />
          <h3 className="font-bold">AI Insights Assistant</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <div className="flex items-center mb-1 text-[10px] font-bold uppercase opacity-50">
                  {msg.role === 'user' ? <User size={10} className="mr-1" /> : <Bot size={10} className="mr-1" />}
                  {msg.role}
                </div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.filters && Object.keys(msg.filters).length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(msg.filters).map(([key, val]) => (
                        <span key={key} className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded flex items-center">
                          <Filter size={8} className="mr-1" /> {key}: {val}
                        </span>
                      ))}
                   </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
          <input
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Ask anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold flex items-center justify-between">
           <div className="flex items-center">
             <Filter size={18} className="mr-2 text-gray-500" />
             Results
           </div>
           {lastResults && <span className="text-xs text-gray-400">{lastResults.length} matches</span>}
        </div>
        
        <div className="flex-1 overflow-auto">
          {lastResults ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Risk</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lastResults.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-[10px] text-gray-400">{c.region}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.company}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.churnRisk === 'High' ? 'bg-red-50 text-red-600' : 
                        c.churnRisk === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 
                        'bg-green-50 text-green-600'
                      }`}>
                        {c.churnRisk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold">{c.healthScore.toFixed(0)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/customers/${c.id}`} className="text-blue-600 hover:underline text-xs font-bold flex items-center justify-end">
                        View <ChevronRight size={14} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12 text-center">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Bot size={48} className="opacity-20" />
              </div>
              <p className="max-w-xs">Ask the AI assistant to search or filter customers based on their behavior and region.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIChat;
