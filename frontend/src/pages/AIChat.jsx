import { useState, useRef, useEffect } from 'react';
import { queryAI } from '../api/client';
import { MessageSquare, Send, Bot, User, ChevronRight, AlertCircle, Filter, Sparkles, TrendingDown, TrendingUp, Activity, Clock, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const suggestedPrompts = [
  { icon: TrendingDown, text: "Who will churn first?", color: "text-red-500 bg-red-50" },
  { icon: Activity, text: "Show unhealthiest customers", color: "text-orange-500 bg-orange-50" },
  { icon: TrendingUp, text: "Top 5 healthiest customers", color: "text-green-500 bg-green-50" },
  { icon: Clock, text: "Contracts expiring soon", color: "text-blue-500 bg-blue-50" },
  { icon: BarChart3, text: "Give me a summary", color: "text-purple-500 bg-purple-50" },
  { icon: Zap, text: "Most inactive customers", color: "text-yellow-500 bg-yellow-50" },
];

function AIChat() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your AI Insights Assistant. I can analyze your customer data with natural language. Try asking me anything — from churn predictions to health rankings to contract renewals.' }
  ]);
  const [lastResults, setLastResults] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    await sendQuery(query);
  };

  const sendQuery = async (text) => {
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await queryAI(text);
      const data = res.data;

      // Build a rich bot message
      const botMsg = { 
        role: 'bot', 
        text: data.summary || `Found ${data.results.length} customers matching your request.`,
        filters: data.filters,
        results: data.results,
        insight: data.insight,
        aggregation: data.aggregation
      };
      setMessages(prev => [...prev, botMsg]);
      setLastResults(data.results);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error processing your request. Please try rephrasing your question.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Render message text with basic markdown bold support
  const renderText = (text) => {
    if (!text) return null;
    // Split by **bold** markers
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
      {/* Chat Area */}
      <div className="lg:col-span-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
            <Sparkles size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">AI Insights Assistant</h3>
            <p className="text-[10px] text-gray-500">Advanced NLP • Real-time Analysis</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <div className="flex items-center mb-1 text-[10px] font-bold uppercase opacity-50">
                  {msg.role === 'user' ? <User size={10} className="mr-1" /> : <Bot size={10} className="mr-1" />}
                  {msg.role}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line">{renderText(msg.text)}</div>
                
                {/* Insight banner */}
                {msg.insight && (
                  <div className={`mt-2 text-xs p-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {msg.insight}
                  </div>
                )}

                {/* Filter badges */}
                {msg.filters && Object.keys(msg.filters).length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(msg.filters).map(([key, val]) => (
                        <span key={key} className={`text-[10px] px-1.5 py-0.5 rounded flex items-center ${
                          msg.role === 'user' ? 'bg-white/20' : 'bg-white border border-gray-200 text-gray-600'
                        }`}>
                          <Filter size={8} className="mr-1" /> {key}: {String(val)}
                        </span>
                      ))}
                   </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggested prompts — only show if no user messages yet */}
          {messages.length <= 1 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Suggested queries</p>
              <div className="grid grid-cols-1 gap-1.5">
                {suggestedPrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(sp.text)}
                    className="flex items-center text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group text-sm border border-transparent hover:border-gray-200"
                  >
                    <div className={`p-1 rounded ${sp.color} mr-2`}>
                      <sp.icon size={12} />
                    </div>
                    <span className="text-gray-600 group-hover:text-gray-900 text-xs">{sp.text}</span>
                    <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50/50">
          <input
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
            placeholder="Ask anything about your customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md active:scale-95">
            <Send size={16} />
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
           {lastResults && <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">{lastResults.length} matches</span>}
        </div>
        
        <div className="flex-1 overflow-auto">
          {lastResults ? (
            lastResults.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Risk</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Health</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">NPS</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Usage</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lastResults.map((c) => {
                    const riskLevel = c.churnRisk?.level || c.churnRisk;
                    const healthScore = c.healthScore || 0;
                    return (
                      <tr key={c.id || c._id} className="hover:bg-blue-50/30 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-[10px] text-gray-400">{c.region}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{c.company}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            riskLevel === 'High' ? 'bg-red-50 text-red-600' : 
                            riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 
                            'bg-green-50 text-green-600'
                          }`}>
                            {riskLevel}
                          </span>
                          {c.churnRisk?.factors?.length > 0 && (
                            <div className="mt-0.5">
                              {c.churnRisk.factors.map((f, i) => (
                                <div key={i} className="text-[9px] text-gray-400">• {f}</div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  healthScore >= 70 ? 'bg-green-500' : 
                                  healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(0, Math.min(100, healthScore))}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{healthScore.toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${
                            (c.npsScore || 0) >= 7 ? 'text-green-600' : 
                            (c.npsScore || 0) >= 5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{c.npsScore}/10</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{c.usage}%</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/customers/${c.id || c._id}`} className="text-blue-600 hover:underline text-xs font-bold flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight size={14} className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12 text-center">
                <div className="p-4 bg-yellow-50 rounded-full mb-4">
                  <AlertCircle size={36} className="text-yellow-400" />
                </div>
                <p className="font-medium text-gray-500">No matching customers found</p>
                <p className="text-sm mt-1 max-w-xs">Try a different query or broaden your search criteria.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12 text-center">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Bot size={48} className="opacity-20" />
              </div>
              <p className="font-medium text-gray-500 mb-1">Ask the AI Assistant</p>
              <p className="text-sm max-w-xs">Ask natural questions to search, rank, and analyze your customer base.</p>
              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>"Show the customer who will churn first"</p>
                <p>"Top 10 by health score in Europe"</p>
                <p>"How many high risk customers?"</p>
                <p>"Customers with NPS below 3"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIChat;
