from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional, List, Tuple
from uuid import UUID
from app.templates.TemplateModels import Template, ContentCategory, Platform
from app.templates.TemplateSchemas import (
    TemplateCreate, TemplateUpdate, TemplateFilter
)


class TemplateService:
    
    @staticmethod
    async def create_template(
        db: AsyncSession,
        template_data: TemplateCreate
    ) -> Template:
        """Create a new template"""
        template = Template(
            category=template_data.category,
            platform=template_data.platform,
            name=template_data.name,
            structure=template_data.structure,
            prompt=template_data.prompt,
            recommended_length=template_data.recommended_length,
            tone=template_data.tone,
            active=template_data.active
        )
        
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def get_template_by_id(
        db: AsyncSession,
        template_id: UUID
    ) -> Optional[Template]:
        """Get template by ID"""
        result = await db.execute(
            select(Template).where(Template.id == template_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_templates(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[TemplateFilter] = None
    ) -> Tuple[List[Template], int]:
        """Get templates with filters and pagination"""
        query = select(Template)
        
        # Apply filters
        if filters:
            if filters.category:
                query = query.where(Template.category == filters.category)
            if filters.platform:
                query = query.where(Template.platform == filters.platform)
            if filters.active is not None:
                query = query.where(Template.active == filters.active)
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.where(
                    or_(
                        Template.name.ilike(search_term),
                        Template.prompt.ilike(search_term)
                    )
                )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(Template.created_at.desc())
        
        result = await db.execute(query)
        templates = result.scalars().all()
        
        return list(templates), total
    
    @staticmethod
    async def get_template_by_category_platform(
        db: AsyncSession,
        category: ContentCategory,
        platform: Platform
    ) -> Optional[Template]:
        """Get active template for specific category and platform"""
        result = await db.execute(
            select(Template)
            .where(
                Template.category == category,
                Template.platform == platform,
                Template.active == True
            )
            .order_by(Template.created_at.desc())
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_active_templates(
        db: AsyncSession,
        limit: int = 100
    ) -> List[Template]:
        """Get all active templates"""
        result = await db.execute(
            select(Template)
            .where(Template.active == True)
            .order_by(Template.category, Template.platform)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def update_template(
        db: AsyncSession,
        template_id: UUID,
        template_data: TemplateUpdate
    ) -> Optional[Template]:
        """Update template"""
        template = await TemplateService.get_template_by_id(db, template_id)
        
        if not template:
            return None
        
        update_data = template_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(template, field, value)
        
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def delete_template(
        db: AsyncSession,
        template_id: UUID
    ) -> bool:
        """Delete template (soft delete by setting active=False)"""
        template = await TemplateService.get_template_by_id(db, template_id)
        
        if not template:
            return False
        
        template.active = False
        await db.commit()
        return True
    
    @staticmethod
    async def hard_delete_template(
        db: AsyncSession,
        template_id: UUID
    ) -> bool:
        """Permanently delete template"""
        template = await TemplateService.get_template_by_id(db, template_id)
        
        if not template:
            return False
        
        await db.delete(template)
        await db.commit()
        return True
    
    @staticmethod
    async def get_templates_by_category(
        db: AsyncSession,
        category: ContentCategory
    ) -> List[Template]:
        """Get all active templates for a category"""
        result = await db.execute(
            select(Template)
            .where(
                Template.category == category,
                Template.active == True
            )
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_templates_by_platform(
        db: AsyncSession,
        platform: Platform
    ) -> List[Template]:
        """Get all active templates for a platform"""
        result = await db.execute(
            select(Template)
            .where(
                Template.platform == platform,
                Template.active == True
            )
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def duplicate_template(
        db: AsyncSession,
        template_id: UUID,
        new_name: str
    ) -> Optional[Template]:
        """Duplicate an existing template"""
        original = await TemplateService.get_template_by_id(db, template_id)
        
        if not original:
            return None
        
        new_template = Template(
            category=original.category,
            platform=original.platform,
            name=new_name,
            structure=original.structure,
            prompt=original.prompt,
            recommended_length=original.recommended_length,
            tone=original.tone,
            active=True
        )
        
        db.add(new_template)
        await db.commit()
        await db.refresh(new_template)
        return new_template
    
    @staticmethod
    async def get_template_stats(
        db: AsyncSession
    ) -> dict:
        """Get statistics about templates"""
        # Total templates
        total_result = await db.execute(select(func.count(Template.id)))
        total = total_result.scalar()
        
        # Active templates
        active_result = await db.execute(
            select(func.count(Template.id)).where(Template.active == True)
        )
        active = active_result.scalar()
        
        # By category
        category_result = await db.execute(
            select(Template.category, func.count(Template.id))
            .where(Template.active == True)
            .group_by(Template.category)
        )
        by_category = {row[0].value: row[1] for row in category_result}
        
        # By platform
        platform_result = await db.execute(
            select(Template.platform, func.count(Template.id))
            .where(Template.active == True)
            .group_by(Template.platform)
        )
        by_platform = {row[0].value: row[1] for row in platform_result}
        
        return {
            "total_templates": total,
            "active_templates": active,
            "inactive_templates": total - active,
            "by_category": by_category,
            "by_platform": by_platform
        }