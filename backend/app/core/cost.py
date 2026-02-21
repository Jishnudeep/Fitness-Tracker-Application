
import os
import time
from datetime import datetime, date
from typing import Dict, Tuple

class CostController:
    """
    Manages simple in-memory rate limiting and token tracking for safety.
    Reset happens daily.
    """
    
    # Configuration
    DAILY_REQUEST_LIMIT = 50
    DAILY_TOKEN_LIMIT = 50000 
    
    def __init__(self):
        self._request_count = 0
        self._token_usage = 0
        self._last_reset_date = date.today()
        
        # Determine if we are in DEV mode (mocking calls)
        self.dev_mode = os.environ.get("DEV_MODE", "False").lower() == "true"

    def _check_reset(self):
        """Resets counters if a new day has started."""
        today = date.today()
        if today > self._last_reset_date:
            self._request_count = 0
            self._token_usage = 0
            self._last_reset_date = today

    def can_proceed(self) -> Tuple[bool, str]:
        """
        Checks if the request can proceed based on rate limits.
        Returns: (Allowed: bool, Reason: str)
        """
        self._check_reset()
        
        if self.dev_mode:
            return True, "Dev Mode (Mock)"
            
        if self._request_count >= self.DAILY_REQUEST_LIMIT:
            return False, f"Daily request limit exceeded ({self.DAILY_REQUEST_LIMIT})"
            
        if self._token_usage >= self.DAILY_TOKEN_LIMIT:
            return False, f"Daily token limit exceeded ({self.DAILY_TOKEN_LIMIT})"
            
        return True, "OK"

    def track_request(self, input_tokens: int = 0, output_tokens: int = 0):
        """
        Increments usage counters. Call this AFTER a successful API call.
        """
        self._check_reset()
        self._request_count += 1
        self._token_usage += (input_tokens + output_tokens)
        
    def get_status(self) -> Dict:
        return {
            "requests": self._request_count,
            "requests_limit": self.DAILY_REQUEST_LIMIT,
            "tokens": self._token_usage,
            "tokens_limit": self.DAILY_TOKEN_LIMIT,
            "date": str(self._last_reset_date),
            "dev_mode": self.dev_mode
        }

# Global Instance
cost_controller = CostController()
