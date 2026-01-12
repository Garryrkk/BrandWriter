import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import re
import time
import logging
import urllib.parse
import random
from urllib.parse import urlparse, urljoin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmailScraper:
    def __init__(self):
        try:
            self.ua = UserAgent()
        except Exception:
            self.ua = None
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        self.session = requests.Session()
        # Heuristics to keep us focused on small product startups
        self.agency_keywords = [
            'agency', 'consulting', 'consultancy', 'consultant', 'clients', 'services',
            'service', 'studio', 'freelance', 'freelancer', 'coaching', 'coach', 'boutique'
        ]
        self.enterprise_keywords = [
            'enterprise', 'fortune 500', 'public company', 'inc 5000', 'nyse', 'nasdaq',
            'ipo', 'multinational', 'global leader'
        ]
        self.product_keywords = [
            'platform', 'product', 'software', 'saas', 'users', 'workflow', 'data',
            'app', 'application', 'api'
        ]
        self.title_keywords = [
            'founder', 'co-founder', 'cofounder', 'cto', 'chief technology officer',
            'head of engineering', 'lead engineer', 'principal engineer', 'staff engineer',
            'vp engineering'
        ]

    def get_headers(self):
        if self.ua:
            try:
                user_agent = self.ua.random
            except Exception:
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
            search_url = f"https://lite.duckduckgo.com/lite/?q={encoded_query}"
            print(f"[SCRAPER] Searching DuckDuckGo Lite for: {query}")

            response = self.session.get(search_url, headers=self.get_headers(), timeout=15)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')

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

    def search_serp_html(self, query, num_results=20):
        """Google-like SERP scraping via HTML (no API)."""
        urls = []
        encoded_query = urllib.parse.quote_plus(query)
        serp_url = f"https://www.google.com/search?q={encoded_query}&num=30"
        try:
            resp = self.session.get(serp_url, headers=self.get_headers(), timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if href.startswith('/url?q='):
                        candidate = href.split('/url?q=')[1].split('&')[0]
                        if candidate.startswith('http'):
                            urls.append(candidate)
            print(f"[SCRAPER] SERP found {len(urls)} URLs")
        except Exception as e:
            print(f"[SCRAPER] SERP search error: {e}")
        return list(set(urls))[:num_results]

    def search_github(self, query, num_results=20):
        """Lightweight GitHub code search for domains in READMEs."""
        urls = []
        encoded_query = urllib.parse.quote_plus(query + " site")
        search_url = f"https://github.com/search?q={encoded_query}&type=code"
        try:
            resp = self.session.get(search_url, headers=self.get_headers(), timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                for a in soup.find_all('a', href=True):
                    text = a.get_text(strip=True)
                    href = a['href']
                    if text and '.' in text and len(text) < 60 and href.startswith('http'):
                        urls.append(text)
            print(f"[SCRAPER] GitHub search extracted {len(urls)} domain-like strings")
        except Exception as e:
            print(f"[SCRAPER] GitHub search error: {e}")
        # Keep only http/https links
        urls = [u for u in urls if u.startswith('http')]
        return list(set(urls))[:num_results]

    def search_duckduckgo_lite(self, query, num_results=20):
        """Search DuckDuckGo Lite (text-only version)"""
        urls = []
        encoded_query = urllib.parse.quote_plus(query)

        try:
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
        """Fallback small startup sites (limited to 15% of leads)"""
        startup_urls = [
            'https://cal.com', 'https://supabase.com', 'https://modal.com', 'https://railway.app',
            'https://render.com', 'https://fly.io', 'https://convex.dev', 'https://upstash.com',
            'https://planetscale.com', 'https://qdrant.tech', 'https://weaviate.io', 'https://nhost.io'
        ]
        return startup_urls

    def search_google(self, query, num_results=40):
        """Discovery orchestrator: multi-source with fallback and minimum threshold."""
        print(f"\n[SCRAPER] === Starting search for: {query} ===")
        interest = query
        results = []
        minimum = max(10, num_results // 2)

        sources = [
            ('bing', lambda q: self.search_bing(q, num_results // 3)),
            ('duckduckgo', lambda q: self.search_duckduckgo_lite(q, num_results // 3)),
            ('serp', lambda q: self.search_serp_html(q, num_results // 3)),
            ('github', lambda q: self.search_github(q, num_results // 3)),
        ]

        for source_name, source in sources:
            try:
                chunk = source(interest)
                if not chunk:
                    print(f"[SCRAPER] {source_name} returned 0 URLs, continuing")
                results.extend(chunk)
                if len(set(results)) >= minimum:
                    break
            except Exception as src_err:
                logger.debug(f"Source {source_name} error: {src_err}")
                continue

        # Fallback curated list if still low (will be capped later in API)
        if len(set(results)) < minimum:
            results.extend(self.get_company_directories(interest)[:10])

        unique_urls = list(set(results))
        random.shuffle(unique_urls)
        print(f"[SCRAPER] Total unique URLs to scrape: {len(unique_urls)}")
        return unique_urls[:num_results]

    def scrape_website(self, url):
        """Extract emails first, classify later. Always return raw extractions."""
        emails = set()
        raw_captures = set()
        signals = {
            'has_agency_keywords': False,
            'has_product_keywords': False,
            'title_hits': set(),
            'text_length': 0,
            'agency_hits': 0,
        }

        try:
            print(f"[SCRAPER] Fetching: {url}")

            response = self.session.get(url, headers=self.get_headers(), timeout=15, allow_redirects=True)

            if response.status_code != 200:
                print(f"[SCRAPER] Got status {response.status_code} for {url}")
                print(f"[EXTRACT] 0 emails extracted from {url} (HTTP {response.status_code})")
                return {'emails': [], 'raw_emails': [], 'signals': signals}

            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            text = soup.get_text(separator=' ')
            text_lower = text.lower()
            signals['text_length'] = len(text_lower)
            signals['agency_hits'] = sum(1 for k in self.agency_keywords + self.enterprise_keywords if k in text_lower)
            if signals['agency_hits'] >= 2:
                signals['has_agency_keywords'] = True
            if any(k in text_lower for k in self.product_keywords):
                signals['has_product_keywords'] = True
            for title_kw in self.title_keywords:
                if title_kw in text_lower:
                    signals['title_hits'].add(title_kw)

            # Method 1: Find emails in raw HTML
            raw_emails = re.findall(self.email_pattern, html)

            # Method 2: Find emails in visible text
            text_emails = re.findall(self.email_pattern, text)

            # Method 2b: Obfuscated patterns
            obfuscated = re.findall(r"[A-Za-z0-9._%+-]+\s*\[at\]\s*[A-Za-z0-9.-]+\s*\[dot\]\s*[A-Za-z]{2,}", text_lower)
            for ob in obfuscated:
                cleaned = ob.replace('[at]', '@').replace('[dot]', '.').replace(' ', '')
                raw_emails.append(cleaned)

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

            # Method 5: Scan script tags for emails and JSON blobs
            for script in soup.find_all('script'):
                script_text = script.get_text() or ''
                raw_emails.extend(re.findall(self.email_pattern, script_text))

            # Combine all found emails (raw, before filtering)
            all_found = set(raw_emails + text_emails)
            raw_captures.update(all_found)
            print(f"[EXTRACT] {len(raw_captures)} raw emails extracted from {url}")

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

                emails.add(email_clean)

            filtered_count = len(raw_captures) - len(emails)
            if emails:
                print(f"[FILTER] {len(emails)} emails passed basic validation (filtered {filtered_count}): {list(emails)[:3]}...")
            else:
                print(f"[FILTER] 0 emails passed validation (filtered {filtered_count} from {len(raw_captures)} raw)")

        except requests.exceptions.Timeout:
            print(f"[SCRAPER] Timeout for {url}")
            print(f"[EXTRACT] 0 emails extracted from {url} (timeout)")
        except requests.exceptions.ConnectionError:
            print(f"[SCRAPER] Connection error for {url}")
            print(f"[EXTRACT] 0 emails extracted from {url} (connection error)")
        except Exception as e:
            print(f"[SCRAPER] Error scraping {url}: {str(e)[:50]}")
            print(f"[EXTRACT] 0 emails extracted from {url} (error)")

        return {
            'emails': list(emails),
            'raw_emails': list(raw_captures),
            'signals': signals,
        }

    def find_contact_pages(self, base_url):
        """Find homepage + key subpages even if unlinked; include sitemap hints."""
        contact_keywords = ['contact', 'about', 'team', 'support', 'help', 'reach', 'connect', 'founders', 'company']
        forced_paths = ['/about', '/company', '/team', '/contact', '/privacy', '/terms', '/docs', '/blog']
        urls_to_check = [base_url]

        try:
            response = self.session.get(base_url, headers=self.get_headers(), timeout=10, allow_redirects=True)
            soup = BeautifulSoup(response.text, 'html.parser')

            from urllib.parse import urlparse, urljoin
            base_parsed = urlparse(base_url)
            base_domain = base_parsed.netloc

            for link in soup.find_all('a', href=True):
                href = link.get('href', '').lower()

                if any(keyword in href for keyword in contact_keywords):
                    full_url = urljoin(base_url, link['href'])

                    url_parsed = urlparse(full_url)
                    if base_domain in url_parsed.netloc:
                        urls_to_check.append(full_url)

            # Always force-scan key pages even if not linked
            for pattern in forced_paths:
                potential_url = urljoin(base_url, pattern)
                urls_to_check.append(potential_url)

            # Probe sitemap.xml for extra internal links
            try:
                sitemap_url = urljoin(base_url, '/sitemap.xml')
                sm_resp = self.session.get(sitemap_url, headers=self.get_headers(), timeout=8)
                if sm_resp.status_code == 200:
                    sm_soup = BeautifulSoup(sm_resp.text, 'xml')
                    for loc in sm_soup.find_all('loc'):
                        href = loc.get_text(strip=True)
                        if base_domain in href:
                            if any(k in href.lower() for k in contact_keywords + ['privacy', 'terms', 'docs', 'blog']):
                                urls_to_check.append(href)
            except Exception:
                pass

        except Exception as e:
            print(f"[SCRAPER] Error finding contact pages: {e}")

        unique = list(dict.fromkeys(urls_to_check))[:15]
        print(f"[SCRAPER] Found {len(unique)} pages to check for {base_url}")
        return unique
