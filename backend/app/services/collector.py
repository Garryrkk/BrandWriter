import re
import requests
from bs4 import BeautifulSoup

EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

def collect_from_website(url: str) -> set[str]:
    emails = set()
    for path in ["", "/contact", "/about"]:
        try:
            r = requests.get(url + path, timeout=8)
            soup = BeautifulSoup(r.text, "html.parser")
            emails |= set(re.findall(EMAIL_REGEX, soup.get_text()))
        except:
            pass
    return emails