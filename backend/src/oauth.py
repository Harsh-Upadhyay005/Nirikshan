"""
Google OAuth 2.0 authentication
"""
import logging
from typing import Optional
import httpx
from fastapi import HTTPException, status

from .config import settings

logger = logging.getLogger(__name__)


class GoogleOAuth:
    """Google OAuth 2.0 authentication handler."""
    
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    def __init__(self):
        self.client_id = settings.google_client_id
        self.client_secret = settings.google_client_secret
        self.redirect_uri = settings.google_redirect_uri
        
        if not all([self.client_id, self.client_secret, self.redirect_uri]):
            logger.warning("Google OAuth not fully configured. OAuth login disabled.")
    
    def is_configured(self) -> bool:
        """Check if Google OAuth is properly configured."""
        return all([self.client_id, self.client_secret, self.redirect_uri])
    
    def get_authorization_url(self) -> str:
        """
        Generate Google OAuth authorization URL.
        
        Returns:
            Authorization URL to redirect user to
        """
        if not self.is_configured():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Optional[dict]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from Google
        
        Returns:
            Token response dict or None if failed
        """
        if not self.is_configured():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        data = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "grant_type": "authorization_code"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.GOOGLE_TOKEN_URL, data=data)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to exchange code for token: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to authenticate with Google"
            )
    
    async def get_user_info(self, access_token: str) -> Optional[dict]:
        """
        Get user information from Google.
        
        Args:
            access_token: Google access token
        
        Returns:
            User info dict with email, name, picture, etc.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.GOOGLE_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to get user info from Google: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user information from Google"
            )


# Global instance
google_oauth = GoogleOAuth()
