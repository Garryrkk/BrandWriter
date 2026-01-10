import React, { useState, useEffect } from 'react';
import { Megaphone, FileText, Save, Plus, X, Calendar, BarChart3, Clock, Zap, Loader2, RefreshCw, Trash2, Edit } from 'lucide-react';
import { mainApi } from '../api/client';

const BrandVoiceDashboard = () => {
  const [currentTab, setCurrentTab] = useState('brand-voice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [totalBrands, setTotalBrands] = useState(0);
  const [currentBrandPage, setCurrentBrandPage] = useState(1);
  const [brandVoice, setBrandVoice] = useState({
    name: '',
    tone: '',
    personality: [],
    writingStyle: '',
    messagingPillars: ['', '', ''],
    keywordsUse: [],
    keywordsAvoid: [],
    targetAudience: '',
    brandGoals: '',
    seedCorpus: '',
    is_active: true
  });

  const personalityOptions = ['Professional', 'Casual', 'Friendly', 'Bold', 'Humorous', 'Empathetic'];

  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const fetchActiveBrand = async () => {
    try {
      setLoading(true);
      const data = await mainApi.brands.getActive();
      setCurrentBrand(data);
      mapBrandToState(data);
      // Store active brand ID for other pages
      localStorage.setItem('active_brand_id', data.id);
    } catch (err) {
      console.error('Error fetching active brand:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async (page = 1, isActive = null) => {
    try {
      setLoading(true);
      const data = await mainApi.brands.list(page, 10);
      setBrands(data.brands);
      setTotalBrands(data.total);
      setCurrentBrandPage(data.page);
      
      if (data.brands.length > 0 && !currentBrand) {
        setCurrentBrand(data.brands[0]);
        mapBrandToState(data.brands[0]);
        localStorage.setItem('active_brand_id', data.brands[0].id);
      }
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async () => {
    try {
      setLoading(true);
      const brandData = {
        name: brandVoice.name,
        tone: brandVoice.tone,
        personality: brandVoice.personality,
        writing_style: brandVoice.writingStyle,
        messaging_pillars: brandVoice.messagingPillars.filter(p => p.trim() !== ''),
        keywords_use: brandVoice.keywordsUse,
        keywords_avoid: brandVoice.keywordsAvoid,
        target_audience: brandVoice.targetAudience,
        brand_goals: brandVoice.brandGoals,
        seed_corpus: brandVoice.seedCorpus,
        is_active: brandVoice.is_active
      };

      const data = await mainApi.brands.create(brandData);
      setCurrentBrand(data);
      localStorage.setItem('active_brand_id', data.id);
      showMessage('Brand created successfully!');
      await fetchBrands();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const updateBrand = async (brandId) => {
    try {
      setLoading(true);
      const brandData = {
        name: brandVoice.name,
        tone: brandVoice.tone,
        personality: brandVoice.personality,
        writing_style: brandVoice.writingStyle,
        messaging_pillars: brandVoice.messagingPillars.filter(p => p.trim() !== ''),
        keywords_use: brandVoice.keywordsUse,
        keywords_avoid: brandVoice.keywordsAvoid,
        target_audience: brandVoice.targetAudience,
        brand_goals: brandVoice.brandGoals,
        seed_corpus: brandVoice.seedCorpus,
        is_active: brandVoice.is_active
      };

      const data = await mainApi.brands.update(brandId, brandData);
      setCurrentBrand(data);
      showMessage('Brand updated successfully!');
      await fetchBrands();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (brandId, hardDelete = false) => {
    if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'deactivate'} this brand?`)) {
      return;
    }

    try {
      setLoading(true);
      await mainApi.brands.delete(brandId);

      showMessage(`Brand ${hardDelete ? 'deleted' : 'deactivated'} successfully!`);
      setCurrentBrand(null);
      localStorage.removeItem('active_brand_id');
      setBrandVoice({
        name: '',
        tone: '',
        personality: [],
        writingStyle: '',
        messagingPillars: ['', '', ''],
        keywordsUse: [],
        keywordsAvoid: [],
        targetAudience: '',
        brandGoals: '',
        seedCorpus: '',
        is_active: true
      });
      await fetchBrands();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const mapBrandToState = (brand) => {
    setBrandVoice({
      name: brand.name || '',
      tone: brand.tone || '',
      personality: brand.personality || [],
      writingStyle: brand.writing_style || '',
      messagingPillars: brand.messaging_pillars?.length > 0 ? brand.messaging_pillars : ['', '', ''],
      keywordsUse: brand.keywords_use || [],
      keywordsAvoid: brand.keywords_avoid || [],
      targetAudience: brand.target_audience || '',
      brandGoals: brand.brand_goals || '',
      seedCorpus: brand.seed_corpus || '',
      is_active: brand.is_active !== undefined ? brand.is_active : true
    });
  };

  useEffect(() => {
    fetchActiveBrand();
    fetchBrands();
  }, []);

  const addKeyword = (type) => {
    const input = prompt(`Enter keyword to ${type === 'use' ? 'use' : 'avoid'}:`);
    if (input) {
      setBrandVoice(prev => ({
        ...prev,
        [type === 'use' ? 'keywordsUse' : 'keywordsAvoid']: [...prev[type === 'use' ? 'keywordsUse' : 'keywordsAvoid'], input]
      }));
    }
  };

  const removeKeyword = (type, index) => {
    setBrandVoice(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const togglePersonality = (trait) => {
    setBrandVoice(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait]
    }));
  };

  const updatePillar = (index, value) => {
    setBrandVoice(prev => ({
      ...prev,
      messagingPillars: prev.messagingPillars.map((p, i) => i === index ? value : p)
    }));
  };

  const saveBrandVoice = async () => {
    if (!brandVoice.name.trim()) {
      showMessage('Please enter a brand name', true);
      return;
    }

    if (currentBrand?.id) {
      await updateBrand(currentBrand.id);
    } else {
      await createBrand();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Published': return 'bg-emerald-500';
      case 'Scheduled': return 'bg-sky-500';
      case 'Draft': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Brand Voice
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {currentBrand && (
                <>
                  <button onClick={() => { setCurrentBrand(null); setBrandVoice({ name: '', tone: '', personality: [], writingStyle: '', messagingPillars: ['', '', ''], keywordsUse: [], keywordsAvoid: [], targetAudience: '', brandGoals: '', seedCorpus: '', is_active: true }); }} className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors">
                    <Plus size={20} />
                    <span>New Brand</span>
                  </button>
                  <button onClick={() => deleteBrand(currentBrand.id, false)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                    <Trash2 size={20} />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button onClick={saveBrandVoice} disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-pink-300 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                <Save size={20} />
                <span>{currentBrand ? 'Update' : 'Create'} Brand</span>
              </button>
            </div>
          </div>

          {/* Horizontal Navigation */}
          <nav className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'brand-voice', label: 'Brand Voice', icon: Megaphone },
              { id: 'all-brands', label: `All Brands (${totalBrands})`, icon: FileText }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                    currentTab === item.id
                      ? 'bg-gradient-to-r from-yellow-200/20 to-pink-200/20 border-2 border-yellow-300/30'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent'
                  }`}
                >
                  <Icon size={18} className={currentTab === item.id ? 'text-yellow-300' : ''} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8 relative">
    <div className="space-y-6">
      {/* Notifications */}
      {(successMessage || error) && (
        <div className={`px-6 py-4 rounded-lg shadow-lg ${
          error ? 'bg-red-500/20 border border-red-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'
        } text-white font-semibold`}>
          {error || successMessage}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-3">
            <Loader2 className="animate-spin" size={24} />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {currentTab === 'all-brands' ? (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold">All Brands</h3>
                  <p className="text-gray-400 text-sm mt-1">Total: {totalBrands} brands</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Tone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {brands.map(brand => (
                        <tr key={brand.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 font-medium">{brand.name}</td>
                          <td className="px-6 py-4 text-gray-400">{brand.tone || 'Not set'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${brand.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600 text-gray-400'}`}>
                              {brand.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            {new Date(brand.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => { setCurrentBrand(brand); mapBrandToState(brand); setCurrentTab('brand-voice'); }} className="text-yellow-200 hover:text-yellow-100 transition-colors p-2" title="Edit brand">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => deleteBrand(brand.id, false)} className="text-red-400 hover:text-red-300 transition-colors p-2" title="Delete brand">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {brands.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>No brands found. Create your first brand!</p>
                    </div>
                  )}
                </div>
                {totalBrands > 10 && (
                  <div className="p-4 border-t border-gray-700 flex justify-between items-center">
                    <button onClick={() => fetchBrands(currentBrandPage - 1)} disabled={currentBrandPage === 1} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50">
                      Previous
                    </button>
                    <span className="text-gray-400">Page {currentBrandPage}</span>
                    <button onClick={() => fetchBrands(currentBrandPage + 1)} disabled={currentBrandPage * 10 >= totalBrands} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50">
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">🏢</span>
                  Brand Name
                </h3>
                <input type="text" value={brandVoice.name} onChange={(e) => setBrandVoice({...brandVoice, name: e.target.value})} placeholder="Enter your brand name" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">🎤</span>
                  Tone & Personality
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Tone</label>
                    <input type="text" value={brandVoice.tone} onChange={(e) => setBrandVoice({...brandVoice, tone: e.target.value})} placeholder="e.g., Professional yet approachable, warm and friendly" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Personality Traits</label>
                    <div className="flex flex-wrap gap-2">
                      {personalityOptions.map(trait => (
                        <button key={trait} onClick={() => togglePersonality(trait)} className={`px-4 py-2 rounded-full transition-colors ${brandVoice.personality.includes(trait) ? 'bg-gradient-to-r from-yellow-200 to-pink-300 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          {trait}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">✍</span>
                  Writing Style
                </h3>
                <textarea value={brandVoice.writingStyle} onChange={(e) => setBrandVoice({...brandVoice, writingStyle: e.target.value})} placeholder="Describe your preferred writing style: sentence length, paragraph structure, use of metaphors, technical vs. simple language, etc." rows={5} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">🧩</span>
                  Messaging Pillars
                </h3>
                <div className="space-y-3">
                  {brandVoice.messagingPillars.map((pillar, index) => (
                    <input key={index} type="text" value={pillar} onChange={(e) => updatePillar(index, e.target.value)} placeholder={`Pillar ${index + 1}: e.g., Innovation, Customer-First, Sustainability`} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔑</span>
                  Keywords to Use / Avoid
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-emerald-400">Keywords to Use</label>
                      <button onClick={() => addKeyword('use')} className="text-emerald-400 hover:text-emerald-300">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[80px] bg-gray-700 rounded-lg p-3">
                      {brandVoice.keywordsUse.map((keyword, index) => (
                        <span key={index} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                          <span>{keyword}</span>
                          <button onClick={() => removeKeyword('keywordsUse', index)}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-red-400">Keywords to Avoid</label>
                      <button onClick={() => addKeyword('avoid')} className="text-red-400 hover:text-red-300">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[80px] bg-gray-700 rounded-lg p-3">
                      {brandVoice.keywordsAvoid.map((keyword, index) => (
                        <span key={index} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                          <span>{keyword}</span>
                          <button onClick={() => removeKeyword('keywordsAvoid', index)}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  Target Audience
                </h3>
                <textarea value={brandVoice.targetAudience} onChange={(e) => setBrandVoice({...brandVoice, targetAudience: e.target.value})} placeholder="Describe your target audience: demographics, psychographics, pain points, goals, etc." rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  Seed Corpus Preview
                </h3>
                <textarea value={brandVoice.seedCorpus} onChange={(e) => setBrandVoice({...brandVoice, seedCorpus: e.target.value})} placeholder="Paste sample content that represents your brand voice (blog posts, social media, emails, etc.)" rows={6} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200 font-mono text-sm" />
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚙️</span>
                  AI Behavior Settings
                </h3>
                <textarea value={brandVoice.brandGoals} onChange={(e) => setBrandVoice({...brandVoice, brandGoals: e.target.value})} placeholder="Define brand goals and AI generation preferences: content length, formatting rules, CTA style, etc." rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={brandVoice.is_active} onChange={(e) => setBrandVoice({...brandVoice, is_active: e.target.checked})} className="w-5 h-5 rounded border-gray-600 text-yellow-200 focus:ring-2 focus:ring-yellow-200" />
                  <span className="text-lg font-medium">Set as Active Brand</span>
                </label>
              </div>
            </div>
          )}
    </div>
      </main>
    </div>
  );
};

export default BrandVoiceDashboard;