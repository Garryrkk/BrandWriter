import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="text-[#0F172A] font-semibold text-lg tracking-tight">
              GenJecX
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#neural-studio" className="text-[#475569] hover:text-[#0F172A] transition-colors">
                Neural Studio
              </a>
              <a href="#research" className="text-[#475569] hover:text-[#0F172A] transition-colors">
                Research & Models
              </a>
              <a href="#case-studies" className="text-[#475569] hover:text-[#0F172A] transition-colors">
                Case Studies
              </a>
              <a href="#founders" className="text-[#475569] hover:text-[#0F172A] transition-colors">
                Founders
              </a>
              <a href="#process" className="text-[#475569] hover:text-[#0F172A] transition-colors">
                Process & Pricing
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="space-y-6">
          <h1 className="text-4xl leading-tight text-[#0F172A] font-normal max-w-4xl">
            GenJecX builds proprietary AI systems and custom neural models for organizations that require intelligence beyond off-the-shelf solutions.
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed max-w-3xl">
            We design, train, and deploy custom intelligence systems grounded in research, neural architecture, and enterprise rigor—not API wrappers.
          </p>
          <div className="flex gap-4 pt-4">
            <a 
              href="#neural-studio" 
              className="px-6 py-3 bg-[#334155] text-white text-sm font-medium hover:bg-[#475569] transition-colors"
            >
              View Neural Studio
            </a>
            <a 
              href="#audit" 
              className="px-6 py-3 border border-[#334155] text-[#334155] text-sm font-medium hover:bg-[#334155] hover:text-white transition-colors"
            >
              Request Architecture Audit
            </a>
          </div>
        </div>
      </section>

      {/* Credibility Strip */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="text-sm text-[#475569] uppercase tracking-wide">Foundation</div>
            <div className="text-[#0F172A]">BITS Pilani Founders</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-[#475569] uppercase tracking-wide">Expertise</div>
            <div className="text-[#0F172A]">CS + AI/ML Honors</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-[#475569] uppercase tracking-wide">Capability</div>
            <div className="text-[#0F172A]">Custom Neural Models</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-[#475569] uppercase tracking-wide">Approach</div>
            <div className="text-[#0F172A]">Long-term R&D Lab</div>
          </div>
        </div>
      </section>

      {/* Capability Snapshot */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl text-[#0F172A] mb-12">What We Build</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-3">
            <h3 className="text-lg text-[#0F172A] font-medium">Custom Model Development</h3>
            <p className="text-[#475569] leading-relaxed">
              Neural networks trained from scratch for domain-specific intelligence where existing models fail.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg text-[#0F172A] font-medium">AI System Architecture</h3>
            <p className="text-[#475569] leading-relaxed">
              End-to-end intelligent systems designed for scale, control, and long-term reliability.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg text-[#0F172A] font-medium">Research-Driven Automation</h3>
            <p className="text-[#475569] leading-relaxed">
              Automation systems built on research principles, not shortcuts or brittle integrations.
            </p>
          </div>
        </div>
      </section>

      {/* Proof of Depth */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-200">
        <h2 className="text-2xl text-[#0F172A] mb-12">Selected Work</h2>
        <div className="space-y-12">
          <div className="space-y-3">
            <div className="text-sm text-[#475569] uppercase tracking-wide">Custom Neural Network</div>
            <h3 className="text-xl text-[#0F172A]">Mental Health Assessment Intelligence</h3>
            <p className="text-[#475569] leading-relaxed max-w-3xl">
              Long-term R&D initiative building specialized neural models for mental health pattern recognition and assessment—trained on curated clinical data with failure mode analysis.
            </p>
            <a href="#case-studies" className="inline-block text-[#334155] text-sm pt-2 hover:underline">
              View case study →
            </a>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-[#475569] uppercase tracking-wide">Tier-2 Platform</div>
            <h3 className="text-xl text-[#0F172A]">Enterprise Document Intelligence System</h3>
            <p className="text-[#475569] leading-relaxed max-w-3xl">
              Custom-trained models for document processing, classification, and extraction—built for scale and accuracy beyond generic API solutions.
            </p>
            <a href="#case-studies" className="inline-block text-[#334155] text-sm pt-2 hover:underline">
              View case study →
            </a>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-[#475569] uppercase tracking-wide">R&D System</div>
            <h3 className="text-xl text-[#0F172A]">Domain-Specific Knowledge Curation Engine</h3>
            <p className="text-[#475569] leading-relaxed max-w-3xl">
              Research-grade system for automated knowledge organization and retrieval—architecture-first design with custom data pipelines.
            </p>
            <a href="#case-studies" className="inline-block text-[#334155] text-sm pt-2 hover:underline">
              View case study →
            </a>
          </div>
        </div>
      </section>

      {/* Philosophy Block */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-200">
        <h2 className="text-2xl text-[#0F172A] mb-12">How We Think</h2>
        <div className="space-y-6 max-w-3xl">
          <p className="text-lg text-[#0F172A] leading-relaxed">
            We do not sell generic AI.
          </p>
          <p className="text-lg text-[#0F172A] leading-relaxed">
            We build intelligence where the problem demands it.
          </p>
          <p className="text-lg text-[#0F172A] leading-relaxed">
            Architecture comes before tooling.
          </p>
          <p className="text-lg text-[#0F172A] leading-relaxed">
            Research precedes scale.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-[#0F172A] font-semibold">GenJecX</div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Research-driven AI systems and custom neural models for organizations requiring intelligence beyond standard solutions.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-[#0F172A] font-medium text-sm">Navigation</div>
              <div className="space-y-2 text-sm">
                <a href="#neural-studio" className="block text-[#475569] hover:text-[#0F172A]">Neural Studio</a>
                <a href="#research" className="block text-[#475569] hover:text-[#0F172A]">Research & Models</a>
                <a href="#case-studies" className="block text-[#475569] hover:text-[#0F172A]">Case Studies</a>
                <a href="#founders" className="block text-[#475569] hover:text-[#0F172A]">Founders</a>
                <a href="#process" className="block text-[#475569] hover:text-[#0F172A]">Process & Pricing</a>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-[#0F172A] font-medium text-sm">Contact</div>
              <div className="text-sm text-[#475569]">
                For architecture audits and project inquiries
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}