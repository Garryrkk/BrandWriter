"""
Seed initial data for Content OS
Run this after database initialization to set up a demo brand
"""

import asyncio
from app.db.database import AsyncSessionLocal
from app.brand.BrandServices import BrandService
from app.brand.BrandSchemas import BrandCreate

async def seed_demo_brand():
    """Seed a demo brand with complete configuration"""
    async with AsyncSessionLocal() as db:
        # Check if any brands exist
        brands, _ = await BrandService.get_all_brands(db, limit=1)
        if brands:
            print("Brands already exist. Skipping seed.")
            return
        
        # Create demo brand
        demo_brand = BrandCreate(
            name="Demo Tech Startup",
            description="An innovative SaaS company building AI-powered productivity tools",
            tagline="Work Smarter, Not Harder",
            mission="To empower teams with intelligent automation that saves time and boosts productivity",
            vision="A world where every professional has AI as their personal assistant",
            values=[
                "Innovation First",
                "User-Centric Design",
                "Transparency",
                "Continuous Learning",
                "Work-Life Balance"
            ],
            
            # Voice & Tone
            voice_profile={
                "personality": "Professional yet approachable, innovative, tech-savvy",
                "style_guide": "Clear, concise, and actionable. Avoid jargon unless explaining it.",
                "key_phrases": [
                    "powered by AI",
                    "boost productivity",
                    "work smarter",
                    "automate the mundane"
                ]
            },
            tone_attributes={
                "formal": 4,
                "casual": 6,
                "professional": 8,
                "friendly": 9,
                "authoritative": 7,
                "playful": 3
            },
            language_preferences={
                "primary_language": "English",
                "avoid_words": ["synergy", "leverage", "paradigm shift"],
                "preferred_terms": {
                    "customers": "users",
                    "software": "platform",
                    "features": "capabilities"
                }
            },
            
            # Visual Identity
            color_palette={
                "primary": "#6366F1",
                "secondary": "#8B5CF6",
                "accent": "#EC4899",
                "neutral": "#64748B",
                "background": "#F8FAFC"
            },
            logo_url="https://example.com/logo.png",
            fonts={
                "heading": "Inter",
                "body": "Inter",
                "accent": "JetBrains Mono"
            },
            
            # Target Audience
            target_audience={
                "demographics": {
                    "age_range": "25-45",
                    "occupation": "Knowledge workers, managers, founders",
                    "income": "$60k-$150k+",
                    "location": "Urban/Suburban, Global"
                },
                "psychographics": {
                    "values": "Efficiency, innovation, career growth",
                    "interests": "Technology, productivity, automation, AI",
                    "pain_points": [
                        "Too many repetitive tasks",
                        "Information overload",
                        "Lack of time for strategic work",
                        "Disconnected tools"
                    ]
                }
            },
            buyer_personas=[
                {
                    "name": "Strategic Sam",
                    "role": "Product Manager",
                    "goals": ["Ship features faster", "Better team coordination"],
                    "challenges": ["Too many meetings", "Context switching"],
                    "motivation": "Career advancement through efficiency"
                },
                {
                    "name": "Founder Fiona",
                    "role": "Startup Founder",
                    "goals": ["Scale without burning out", "Automate operations"],
                    "challenges": ["Limited resources", "Wearing too many hats"],
                    "motivation": "Build sustainable business"
                }
            ],
            
            # Industry & Positioning
            industry="Technology",
            sub_industry="SaaS / Productivity Tools",
            positioning_statement="For busy professionals who need to do more with less, our AI-powered platform automates repetitive work so you can focus on what matters most",
            unique_value_proposition="The only productivity platform that learns your workflow and proactively suggests automations",
            competitors=[
                {
                    "name": "Notion",
                    "strength": "Flexibility",
                    "weakness": "Lacks AI automation"
                },
                {
                    "name": "Monday.com",
                    "strength": "Team collaboration",
                    "weakness": "Overwhelming for individuals"
                },
                {
                    "name": "Zapier",
                    "strength": "Integration ecosystem",
                    "weakness": "Requires manual setup"
                }
            ],
            
            # Social Media
            social_handles={
                "instagram": "@demotechstartup",
                "linkedin": "company/demotechstartup",
                "youtube": "@DemoTechStartup",
                "twitter": "@demotechco"
            },
            
            # Content Strategy
            content_pillars=[
                "Product Updates & Features",
                "Productivity Tips & Hacks",
                "AI & Technology Trends",
                "Customer Success Stories",
                "Behind the Scenes / Culture"
            ],
            hashtag_sets={
                "productivity": [
                    "#productivity",
                    "#worksmarter",
                    "#timemanagement",
                    "#efficiency",
                    "#getthingsdone"
                ],
                "ai": [
                    "#artificialintelligence",
                    "#aitools",
                    "#automation",
                    "#machinelearning",
                    "#futureofwork"
                ],
                "startup": [
                    "#startuplife",
                    "#saas",
                    "#techstartup",
                    "#entrepreneurship",
                    "#innovation"
                ]
            },
            posting_schedule={
                "instagram": {
                    "posts_per_week": 5,
                    "best_times": ["9:00 AM", "12:00 PM", "5:00 PM"],
                    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                },
                "linkedin": {
                    "posts_per_week": 3,
                    "best_times": ["8:00 AM", "12:00 PM"],
                    "days": ["Tuesday", "Wednesday", "Thursday"]
                },
                "youtube": {
                    "shorts_per_week": 3,
                    "best_times": ["6:00 PM"],
                    "days": ["Monday", "Wednesday", "Friday"]
                }
            },
            
            is_active=True
        )
        
        brand = await BrandService.create_brand(db, demo_brand)
        print(f"✓ Created demo brand: {brand.name} (ID: {brand.id})")
        return brand

async def seed_sample_documents():
    """Seed sample RAG documents"""
    from app.services.rag_service import RAGService
    from app.services.brand_service import BrandService
    
    async with AsyncSessionLocal() as db:
        # Get the demo brand
        brand = await BrandService.get_active_brand(db)
        if not brand:
            print("No brand found. Run seed_demo_brand first.")
            return
        
        rag_service = RAGService()
        
        sample_docs = [
            {
                "title": "Product Philosophy",
                "content": """Our platform is built on three core principles:
                
1. Intelligence First: Every feature should leverage AI to reduce manual work
2. Seamless Integration: Connect with tools users already love
3. Privacy Matters: User data stays secure and private

We believe productivity tools should fade into the background, quietly handling 
the busywork so people can focus on creative and strategic thinking.""",
                "category": "brand_voice"
            },
            {
                "title": "Feature Highlights 2024",
                "content": """Key features launched this year:

- Smart Task Prioritization: AI ranks your to-dos by impact
- Meeting Summaries: Auto-generated notes from video calls  
- Email Assistant: Draft responses in your writing style
- Workflow Automation: No-code automation builder
- Team Insights: Analytics on productivity patterns""",
                "category": "product"
            },
            {
                "title": "Customer Success Story - TechCorp",
                "content": """TechCorp, a 50-person startup, was drowning in administrative work. 
After implementing our platform:

- Saved 15 hours per week per employee
- Reduced meeting time by 40%
- Increased feature shipping velocity by 2.5x
- Improved employee satisfaction scores

"This platform gave us our time back," says their CTO.""",
                "category": "case_study"
            }
        ]
        
        for doc in sample_docs:
            await rag_service.add_document(
                db=db,
                brand_id=brand.id,
                title=doc["title"],
                content=doc["content"],
                source="seed_data",
                document_type="article",
                category=doc["category"]
            )
            print(f"✓ Added document: {doc['title']}")

async def run_seed():
    """Run all seed functions"""
    print("🌱 Seeding database...")
    
    await seed_demo_brand()
    await seed_sample_documents()
    
    print("✅ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(run_seed())