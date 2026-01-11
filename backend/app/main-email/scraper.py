import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import re
import time
import logging
import urllib.parse
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailScraper:
    def __init__(self):
        try:
            self.ua = UserAgent()
        except:
            self.ua = None
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        self.session = requests.Session()
        
    def get_headers(self):
        if self.ua:
            try:
                user_agent = self.ua.random
            except:
                user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        else:
            user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            
        return {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def search_bing(self, query, num_results=20):
        """Search Bing for URLs"""
        urls = []
        encoded_query = urllib.parse.quote_plus(query)
        
        try:
            search_url = f"https://www.bing.com/search?q={encoded_query}&count=50"
            print(f"[SCRAPER] Searching Bing for: {query}")
            
            response = self.session.get(search_url, headers=self.get_headers(), timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Bing search results
                for result in soup.find_all('li', class_='b_algo'):
                    link = result.find('a')
                    if link and link.get('href'):
                        href = link['href']
                        if href.startswith('http') and 'bing.com' not in href and 'microsoft.com' not in href:
                            urls.append(href)
                
                # Also try regular links
                if len(urls) < 5:
                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        if href.startswith('http') and 'bing.com' not in href and 'microsoft.com' not in href and 'go.microsoft' not in href:
                            if any(x in href for x in ['.com', '.org', '.io', '.co', '.net']):
                                urls.append(href)
                
                print(f"[SCRAPER] Bing found {len(urls)} URLs")
            else:
                print(f"[SCRAPER] Bing returned status {response.status_code}")
                
        except Exception as e:
            print(f"[SCRAPER] Bing search error: {e}")
            logger.error(f"Bing search error: {e}")
        
        return list(set(urls))[:num_results]
    
    def search_duckduckgo_lite(self, query, num_results=20):
        """Search DuckDuckGo Lite (text-only version)"""
        urls = []
        encoded_query = urllib.parse.quote_plus(query)
        
        try:
            # Use lite version which is simpler
            search_url = f"https://lite.duckduckgo.com/lite/?q={encoded_query}"
            print(f"[SCRAPER] Searching DuckDuckGo Lite for: {query}")
            
            response = self.session.get(search_url, headers=self.get_headers(), timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all links in results
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if href.startswith('http') and 'duckduckgo.com' not in href:
                        urls.append(href)
                
                print(f"[SCRAPER] DuckDuckGo Lite found {len(urls)} URLs")
            else:
                print(f"[SCRAPER] DuckDuckGo Lite returned status {response.status_code}")
                
        except Exception as e:
            print(f"[SCRAPER] DuckDuckGo Lite error: {e}")
        
        return list(set(urls))[:num_results]
    
    def get_company_directories(self, interest):
        """Get URLs from company directories based on interest - DISABLED to focus on small businesses"""
        # Disabled hardcoded big companies - we'll rely on search results only
        return []
    
    def search_google(self, query, num_results=30):
        """Main search function combining multiple sources"""
        print(f"\n[SCRAPER] === Starting search for: {query} ===")
        all_urls = []
        
        # Extract interest from query
        interest = query.replace('contact email', '').replace('email', '').strip()
        
        # 1. Get directory URLs first (these are reliable)
        directory_urls = self.get_company_directories(interest)
        all_urls.extend(directory_urls)
        print(f"[SCRAPER] Got {len(directory_urls)} directory URLs for '{interest}'")
        
        # 2. Try Bing search - targeting small businesses and startups
        time.sleep(1)
        bing_urls = self.search_bing(f"{interest} startup small business contact email -enterprise -corporation", num_results // 2)
        all_urls.extend(bing_urls)
        
        # 3. Try DuckDuckGo Lite - targeting indie/small companies
        time.sleep(1)
        ddg_urls = self.search_duckduckgo_lite(f"small {interest} company founder email contact", num_results // 2)
        all_urls.extend(ddg_urls)
        
        # Remove duplicates and limit
        unique_urls = list(set(all_urls))
        random.shuffle(unique_urls)  # Randomize order
        
        print(f"[SCRAPER] Total unique URLs to scrape: {len(unique_urls)}")
        return unique_urls[:num_results]
    
    def scrape_website(self, url):
        """Extract emails from a website - REAL scraping"""
        emails = set()
        
        try:
            print(f"[SCRAPER] Scraping: {url}")
            
            response = self.session.get(url, headers=self.get_headers(), timeout=15, allow_redirects=True)
            
            if response.status_code != 200:
                print(f"[SCRAPER] Got status {response.status_code} for {url}")
                return []
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # Method 1: Find emails in raw HTML
            raw_emails = re.findall(self.email_pattern, html)
            
            # Method 2: Find emails in visible text
            text = soup.get_text(separator=' ')
            text_emails = re.findall(self.email_pattern, text)
            
            # Method 3: Find mailto links
            for link in soup.find_all('a', href=True):
                href = link['href']
                if 'mailto:' in href.lower():
                    email = href.lower().replace('mailto:', '').split('?')[0].strip()
                    if email and '@' in email:
                        raw_emails.append(email)
            
            # Method 4: Check onclick handlers and data attributes
            for tag in soup.find_all(attrs=True):
                for attr_value in tag.attrs.values():
                    if isinstance(attr_value, str):
                        attr_emails = re.findall(self.email_pattern, attr_value)
                        raw_emails.extend(attr_emails)
            
            # Combine all found emails
            all_found = set(raw_emails + text_emails)
            
            # Filter out invalid/fake emails
            excluded_patterns = [
                'example.com', 'test.com', 'domain.com', 'email.com',
                'yoursite.com', 'yourdomain.com', 'company.com', 'website.com',
                'sentry.io', 'wixpress.com', 'placeholder', 'sample.com',
                'localhost', '127.0.0.1', 'schema.org', 'w3.org',
                '.png', '.jpg', '.gif', '.svg', '.webp', '.css', '.js',
                'webpack', 'node_modules', 'jquery', 'bootstrap'
            ]
            
            for email in all_found:
                email_clean = email.lower().strip()
                
                # Skip invalid patterns
                if any(excl in email_clean for excl in excluded_patterns):
                    continue
                
                # Skip if too short or too long
                if len(email_clean) < 6 or len(email_clean) > 80:
                    continue
                
                # Must have @ and valid TLD
                if '@' not in email_clean:
                    continue
                
                parts = email_clean.split('@')
                if len(parts) != 2:
                    continue
                
                local, domain = parts
                if not local or not domain:
                    continue
                
                # Domain must have a dot and valid TLD
                if '.' not in domain:
                    continue
                
                tld = domain.split('.')[-1]
                if len(tld) < 2 or len(tld) > 6 or not tld.isalpha():
                    continue
                
                # Passed all checks - add it
                emails.add(email_clean)
            
            if emails:
                print(f"[SCRAPER] ✓ Found {len(emails)} valid emails: {list(emails)[:3]}...")
            else:
                print(f"[SCRAPER] ✗ No valid emails found on {url}")
                
        except requests.exceptions.Timeout:
            print(f"[SCRAPER] Timeout for {url}")
        except requests.exceptions.ConnectionError as e:
            print(f"[SCRAPER] Connection error for {url}")
        except Exception as e:
            print(f"[SCRAPER] Error scraping {url}: {str(e)[:50]}")
        
        return list(emails)
    
    def find_contact_pages(self, base_url):
        """Find contact/about pages on a website"""
        contact_keywords = ['contact', 'about', 'team', 'support', 'help', 'reach', 'connect']
        urls_to_check = [base_url]
        
        try:
            response = self.session.get(base_url, headers=self.get_headers(), timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            from urllib.parse import urlparse, urljoin
            base_parsed = urlparse(base_url)
            base_domain = base_parsed.netloc
            
            for link in soup.find_all('a', href=True):
                href = link.get('href', '').lower()
                
                if any(keyword in href for keyword in contact_keywords):
                    # Resolve relative URLs
                    full_url = urljoin(base_url, link['href'])
                    
                    # Make sure it's same domain
                    url_parsed = urlparse(full_url)
                    if base_domain in url_parsed.netloc:
                        urls_to_check.append(full_url)
        
        except Exception as e:
            print(f"[SCRAPER] Error finding contact pages: {e}")
        
        unique = list(set(urls_to_check))[:5]
        print(f"[SCRAPER] Found {len(unique)} pages to check for {base_url}")
        return unique
