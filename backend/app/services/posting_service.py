from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schedule.ScheduleModels import Schedule

class PostingService:
    """Service for posting content to various social media platforms"""
    
    @staticmethod
    async def post_to_instagram(schedule: Schedule) -> Dict[str, Any]:
        """Post content to Instagram"""
        # Using Instagram Graph API
        # This requires Meta Business Account and Access Token
        
        content = schedule.content
        assets = schedule.assets or {}
        
        try:
            # Determine content type
            if assets.get('videos'):
                # Post Reel
                return await PostingService._post_instagram_reel(schedule)
            elif len(assets.get('images', [])) > 1:
                # Post Carousel
                return await PostingService._post_instagram_carousel(schedule)
            elif assets.get('images'):
                # Post single image
                return await PostingService._post_instagram_image(schedule)
            else:
                # Text-only post (requires image on Instagram)
                raise Exception("Instagram requires at least one image")
        
        except Exception as e:
            raise Exception(f"Instagram posting failed: {str(e)}")
    
    @staticmethod
    async def _post_instagram_image(schedule: Schedule) -> Dict[str, Any]:
        """Post single image to Instagram"""
        url = f"https://graph.facebook.com/v18.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
        
        content = schedule.content
        image_url = schedule.assets['images'][0]
        
        # Create media container
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                params={
                    'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                    'image_url': image_url,
                    'caption': content.get('caption', ''),
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to create media: {response.text}")
            
            creation_id = response.json()['id']
            
            # Publish media
            publish_url = f"https://graph.facebook.com/v18.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish"
            publish_response = await client.post(
                publish_url,
                params={
                    'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                    'creation_id': creation_id
                }
            )
            
            if publish_response.status_code != 200:
                raise Exception(f"Failed to publish: {publish_response.text}")
            
            result = publish_response.json()
            return {
                'platform_post_id': result['id'],
                'published_url': f"https://instagram.com/p/{result['id']}"
            }
    
    @staticmethod
    async def _post_instagram_reel(schedule: Schedule) -> Dict[str, Any]:
        """Post Reel to Instagram"""
        # Similar to image but with video_url parameter
        url = f"https://graph.facebook.com/v18.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
        
        content = schedule.content
        video_url = schedule.assets['videos'][0]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                params={
                    'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                    'media_type': 'REELS',
                    'video_url': video_url,
                    'caption': content.get('caption', ''),
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to create reel: {response.text}")
            
            creation_id = response.json()['id']
            
            # Publish
            publish_url = f"https://graph.facebook.com/v18.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish"
            publish_response = await client.post(
                publish_url,
                params={
                    'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                    'creation_id': creation_id
                }
            )
            
            result = publish_response.json()
            return {
                'platform_post_id': result['id'],
                'published_url': f"https://instagram.com/reel/{result['id']}"
            }
    
    @staticmethod
    async def _post_instagram_carousel(schedule: Schedule) -> Dict[str, Any]:
        """Post Carousel to Instagram"""
        # Instagram carousel requires creating multiple media containers
        # then combining them
        
        url = f"https://graph.facebook.com/v18.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
        
        content = schedule.content
        images = schedule.assets['images']
        
        media_ids = []
        
        async with httpx.AsyncClient() as client:
            # Create media container for each image
            for image_url in images:
                response = await client.post(
                    url,
                    params={
                        'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                        'image_url': image_url,
                        'is_carousel_item': True
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Failed to create carousel item: {response.text}")
                
                media_ids.append(response.json()['id'])
            
            # Create carousel container
            carousel_response = await client.post(
                url,
                params={
                    'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                    'media_type': 'CAROUSEL',
                    'children': ','.join(media_ids),
                    'caption': content.get('caption', '')
                }
            )
            
            if carousel_response.status_code != 200:
                raise Exception(f"Failed to create carousel: {carousel_response.text}")
            
            creation_id = carousel_response.json()['id']
            
            # Publish
            publish_url = f"https://graph.facebook.com/v18.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish"
            publish_response = await client.post(
                publish_url,
                params={
                    'access_token': settings.INSTAGRAM_ACCESS_TOKEN,
                    'creation_id': creation_id
                }
            )
            
            result = publish_response.json()
            return {
                'platform_post_id': result['id'],
                'published_url': f"https://instagram.com/p/{result['id']}"
            }
    
    @staticmethod
    async def post_to_linkedin(schedule: Schedule) -> Dict[str, Any]:
        """Post content to LinkedIn"""
        url = "https://api.linkedin.com/v2/ugcPosts"
        
        content = schedule.content
        
        post_data = {
            "author": f"urn:li:organization:{settings.LINKEDIN_ORG_ID}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content.get('text', '')
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        # Add media if present
        if schedule.assets and schedule.assets.get('images'):
            # Would need to upload media first, then reference
            # This is simplified
            pass
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={
                    'Authorization': f'Bearer {settings.LINKEDIN_ACCESS_TOKEN}',
                    'Content-Type': 'application/json'
                },
                json=post_data
            )
            
            if response.status_code not in [200, 201]:
                raise Exception(f"LinkedIn posting failed: {response.text}")
            
            result = response.json()
            post_id = result['id']
            
            return {
                'platform_post_id': post_id,
                'published_url': f"https://linkedin.com/feed/update/{post_id}"
            }
    
    @staticmethod
    async def post_to_youtube(schedule: Schedule) -> Dict[str, Any]:
        """Post content to YouTube (Shorts)"""
        # YouTube API requires OAuth2 and video upload
        # This is a simplified placeholder
        
        raise NotImplementedError("YouTube posting not yet implemented")
    
    @staticmethod
    async def send_email(schedule: Schedule) -> Dict[str, Any]:
        """Send email using SendGrid"""
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        content = schedule.content
        
        message = Mail(
            from_email=content.get('from_email'),
            to_emails=content.get('to_email'),
            subject=content.get('subject'),
            html_content=content.get('html_content')
        )
        
        try:
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
            
            return {
                'platform_post_id': response.headers.get('X-Message-Id'),
                'published_url': 'email_sent'
            }
        
        except Exception as e:
            raise Exception(f"Email sending failed: {str(e)}")