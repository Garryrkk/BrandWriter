import json
import os
from datetime import datetime
from typing import List, Optional, Dict

# Path to your account metadata JSON
METADATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'linkedin_accounts.json')


class LinkedInAccount:
    """
    Represents a LinkedIn account in your system.
    """
    def __init__(
        self,
        internal_id: str,
        profile_url: str,
        cookies_path: str,
        status: str,
        daily_profile_limit: int,
        daily_dm_limit: int,
        last_verified: Optional[str] = None
    ):
        self.internal_id = internal_id
        self.profile_url = profile_url
        self.cookies_path = cookies_path
        self.status = status.upper()
        self.daily_profile_limit = daily_profile_limit
        self.daily_dm_limit = daily_dm_limit
        self.last_verified = last_verified

    def is_active(self) -> bool:
        """
        Returns True if the account status is ACTIVE and cookies file exists.
        """
        return self.status == "ACTIVE" and os.path.exists(self.cookies_path)


class AccountLoader:
    """
    Loads LinkedIn accounts from the JSON metadata file.
    """
    def __init__(self, metadata_file: str = METADATA_FILE):
        self.metadata_file = metadata_file
        self.accounts: Dict[str, LinkedInAccount] = {}
        self.load_accounts()

    def load_accounts(self):
        """
        Load all accounts from JSON into LinkedInAccount objects.
        """
        if not os.path.exists(self.metadata_file):
            raise FileNotFoundError(f"Account metadata file not found: {self.metadata_file}")

        with open(self.metadata_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for internal_id, info in data.items():
            account = LinkedInAccount(
                internal_id=internal_id,
                profile_url=info['linkedin_profile_url'],
                cookies_path=info['cookies_path'],
                status=info.get('status', 'PAUSED'),
                daily_profile_limit=info.get('daily_profile_limit', 100),
                daily_dm_limit=info.get('daily_dm_limit', 25),
                last_verified=info.get('last_verified')
            )
            self.accounts[internal_id] = account

    def get_all_accounts(self) -> List[LinkedInAccount]:
        """
        Returns all LinkedIn accounts.
        """
        return list(self.accounts.values())

    def get_active_accounts(self) -> List[LinkedInAccount]:
        """
        Returns only accounts that are ACTIVE and have a valid cookies file.
        """
        return [acc for acc in self.accounts.values() if acc.is_active()]

    def get_account(self, internal_id: str) -> Optional[LinkedInAccount]:
        """
        Returns a single account by internal ID, or None if not found.
        """
        return self.accounts.get(internal_id)

    def update_last_verified(self, internal_id: str):
        """
        Updates the last_verified timestamp of an account in memory and JSON file.
        """
        account = self.get_account(internal_id)
        if account:
            account.last_verified = datetime.utcnow().isoformat()
            self.save_accounts()
        else:
            raise ValueError(f"Account not found: {internal_id}")

    def save_accounts(self):
        """
        Save all accounts back to the JSON metadata file.
        """
        data_to_save = {}
        for internal_id, acc in self.accounts.items():
            data_to_save[internal_id] = {
                'linkedin_profile_url': acc.profile_url,
                'cookies_path': acc.cookies_path,
                'status': acc.status,
                'daily_profile_limit': acc.daily_profile_limit,
                'daily_dm_limit': acc.daily_dm_limit,
                'last_verified': acc.last_verified
            }

        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=4)
