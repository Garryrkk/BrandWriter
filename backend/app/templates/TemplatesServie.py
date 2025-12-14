from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.templates.TemplatesModels import Template
from app.templates.TemplatesSchemas import TemplateCreate, TemplateUpdate, TemplateFilter, TemplateRating

class TemplateService:
    """Service layer for Template operations"""
    
    @staticmethod
    async def create_template(db: AsyncSession, template_data: TemplateCreate) -> Template:
        """Create a new template"""
        # Set name from title for backward compatibility
        template_dict = template_data.model_dump()
        if 'title' in template_dict and 'name' not in template_dict:
            template_dict['name'] = template_dict['title']
        
        template = Template(**template_dict)
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def get_template_by_id(db: AsyncSession, template_id: UUID) -> Optional[Template]:
        """Get template by ID"""
        result = await db.execute(
            select(Template).where(Template.id == template_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_templates_by_brand(
        db: AsyncSession,
        brand_id: UUID,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[TemplateFilter] = None
    ) -> tuple[List[Template], int]:
        """Get all templates for a brand with filters"""
        query = select(Template).where(Template.brand_id == brand_id)
        
        # Apply filters
        if filters:
            if filters.category:
                query = query.where(Template.category == filters.category)
            if filters.platform:
                query = query.where(Template.platform == filters.platform)
            if filters.template_type:
                query = query.where(Template.template_type == filters.template_type)
            if filters.is_active is not None:
                query = query.where(Template.is_active == filters.is_active)
            if filters.is_default is not None:
                query = query.where(Template.is_default == filters.is_default)
            if filters.is_public is not None:
                query = query.where(Template.is_public == filters.is_public)
            if filters.tags:
                # Check if any of the filter tags exist in template tags
                for tag in filters.tags:
                    query = query.where(Template.tags.contains([tag]))
            if filters.search_query:
                search = f"%{filters.search_query}%"
                query = query.where(
                    or_(
                        Template.title.ilike(search),
                        Template.description.ilike(search)
                    )
                )
        
        # Get total count
        count_query = select(func.count()).select_from(Template).where(Template.brand_id == brand_id)
        if filters:
            if filters.category:
                count_query = count_query.where(Template.category == filters.category)
            if filters.is_active is not None:
                count_query = count_query.where(Template.is_active == filters.is_active)
        
        total = await db.scalar(count_query)
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Template.created_at.desc())
        result = await db.execute(query)
        templates = result.scalars().all()
        
        return list(templates), total or 0
    
    @staticmethod
    async def get_templates_by_category(
        db: AsyncSession,
        brand_id: UUID,
        category: str,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Template], int]:
        """Get templates by specific category"""
        query = select(Template).where(
            and_(
                Template.brand_id == brand_id,
                Template.category == category,
                Template.is_active == True
            )
        )
        
        count_query = select(func.count()).select_from(Template).where(
            and_(
                Template.brand_id == brand_id,
                Template.category == category,
                Template.is_active == True
            )
        )
        total = await db.scalar(count_query)
        
        query = query.offset(skip).limit(limit).order_by(Template.usage_count.desc())
        result = await db.execute(query)
        templates = result.scalars().all()
        
        return list(templates), total or 0
    
    @staticmethod
    async def get_default_template(
        db: AsyncSession,
        brand_id: UUID,
        category: str,
        platform: Optional[str] = None
    ) -> Optional[Template]:
        """Get default template for a category/platform"""
        query = select(Template).where(
            and_(
                Template.brand_id == brand_id,
                Template.category == category,
                Template.is_default == True,
                Template.is_active == True
            )
        )
        
        if platform:
            query = query.where(Template.platform == platform)
        
        result = await db.execute(query.limit(1))
        return result.scalar_one_or_none()
    
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
        update_data['updated_at'] = datetime.utcnow()
        
        # Update name if title is updated
        if 'title' in update_data:
            update_data['name'] = update_data['title']
        
        await db.execute(
            update(Template)
            .where(Template.id == template_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def delete_template(db: AsyncSession, template_id: UUID) -> bool:
        """Delete template (soft delete by setting is_active=False)"""
        result = await db.execute(
            update(Template)
            .where(Template.id == template_id)
            .values(is_active=False, updated_at=datetime.utcnow())
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def hard_delete_template(db: AsyncSession, template_id: UUID) -> bool:
        """Permanently delete template"""
        result = await db.execute(
            delete(Template).where(Template.id == template_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def increment_usage(
        db: AsyncSession,
        template_id: UUID
    ) -> Optional[Template]:
        """Increment template usage count"""
        template = await TemplateService.get_template_by_id(db, template_id)
        if not template:
            return None
        
        await db.execute(
            update(Template)
            .where(Template.id == template_id)
            .values(
                usage_count=Template.usage_count + 1,
                last_used_at=datetime.utcnow()
            )
        )
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def add_rating(
        db: AsyncSession,
        template_id: UUID,
        rating: TemplateRating
    ) -> Optional[Template]:
        """Add user rating to template"""
        template = await TemplateService.get_template_by_id(db, template_id)
        if not template:
            return None
        
        # Calculate new average rating
        current_total = template.avg_rating * template.total_ratings
        new_total = current_total + rating.rating
        new_count = template.total_ratings + 1
        new_avg = new_total / new_count
        
        await db.execute(
            update(Template)
            .where(Template.id == template_id)
            .values(
                avg_rating=new_avg,
                total_ratings=new_count
            )
        )
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def update_performance_metrics(
        db: AsyncSession,
        template_id: UUID,
        success: bool,
        engagement: Optional[float] = None
    ) -> Optional[Template]:
        """Update template performance metrics"""
        template = await TemplateService.get_template_by_id(db, template_id)
        if not template:
            return None
        
        # Calculate new success rate
        total_uses = template.usage_count
        current_successes = (template.success_rate / 100) * total_uses
        new_successes = current_successes + (1 if success else 0)
        new_success_rate = (new_successes / total_uses * 100) if total_uses > 0 else 0
        
        update_values = {
            'success_rate': new_success_rate
        }
        
        # Update engagement if provided
        if engagement is not None:
            current_total_engagement = template.avg_engagement * total_uses
            new_total_engagement = current_total_engagement + engagement
            new_avg_engagement = new_total_engagement / total_uses if total_uses > 0 else 0
            update_values['avg_engagement'] = new_avg_engagement
        
        await db.execute(
            update(Template)
            .where(Template.id == template_id)
            .values(**update_values)
        )
        await db.commit()
        await db.refresh(template)
        return template
    
    @staticmethod
    async def clone_template(
        db: AsyncSession,
        template_id: UUID,
        brand_id: UUID,
        new_title: str,
        modifications: Optional[Dict[str, Any]] = None
    ) -> Optional[Template]:
        """Clone an existing template"""
        original = await TemplateService.get_template_by_id(db, template_id)
        if not original:
            return None
        
        # Create new template from original
        cloned_data = {
            'brand_id': brand_id,
            'title': new_title,
            'name': new_title,
            'description': original.description,
            'category': original.category,
            'platform': original.platform,
            'template_type': original.template_type,
            'structure': original.structure,
            'variables': original.variables,
            'system_prompt': original.system_prompt,
            'user_prompt_template': original.user_prompt_template,
            'examples': original.examples,
            'formatting_rules': original.formatting_rules,
            'platform_config': original.platform_config,
            'content_guidelines': original.content_guidelines,
            'tags': original.tags,
            'is_active': True,
            'is_default': False,
            'parent_template_id': original.id,
            'version': '1.0'
        }
        
        # Apply modifications if provided
        if modifications:
            cloned_data.update(modifications)
        
        cloned_template = Template(**cloned_data)
        db.add(cloned_template)
        await db.commit()
        await db.refresh(cloned_template)
        return cloned_template
    
    @staticmethod
    async def get_most_used_templates(
        db: AsyncSession,
        brand_id: UUID,
        limit: int = 10
    ) -> List[Template]:
        """Get most used templates"""
        result = await db.execute(
            select(Template)
            .where(
                and_(
                    Template.brand_id == brand_id,
                    Template.is_active == True
                )
            )
            .order_by(Template.usage_count.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_highest_rated_templates(
        db: AsyncSession,
        brand_id: UUID,
        limit: int = 10
    ) -> List[Template]:
        """Get highest rated templates"""
        result = await db.execute(
            select(Template)
            .where(
                and_(
                    Template.brand_id == brand_id,
                    Template.is_active == True,
                    Template.total_ratings > 0
                )
            )
            .order_by(Template.avg_rating.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_template_stats(
        db: AsyncSession,
        brand_id: UUID
    ) -> Dict[str, Any]:
        """Get template statistics"""
        # Total count
        total_result = await db.execute(
            select(func.count(Template.id))
            .where(
                and_(
                    Template.brand_id == brand_id,
                    Template.is_active == True
                )
            )
        )
        total = total_result.scalar() or 0
        
        # By category
        category_result = await db.execute(
            select(
                Template.category,
                func.count(Template.id).label('count')
            )
            .where(
                and_(
                    Template.brand_id == brand_id,
                    Template.is_active == True
                )
            )
            .group_by(Template.category)
        )
        by_category = {row.category: row.count for row in category_result}
        
        # By platform
        platform_result = await db.execute(
            select(
                Template.platform,
                func.count(Template.id).label('count')
            )
            .where(
                and_(
                    Template.brand_id == brand_id,
                    Template.is_active == True,
                    Template.platform.isnot(None)
                )
            )
            .group_by(Template.platform)
        )
        by_platform = {row.platform: row.count for row in platform_result}
        
        # Average success rate
        avg_success_result = await db.execute(
            select(func.avg(Template.success_rate))
            .where(
                and_(
                    Template.brand_id == brand_id,
                    Template.is_active == True,
                    Template.usage_count > 0
                )
            )
        )
        avg_success_rate = avg_success_result.scalar() or 0
        
        return {
            'total_templates': total,
            'by_category': by_category,
            'by_platform': by_platform,
            'avg_success_rate': round(float(avg_success_rate), 2)
        }