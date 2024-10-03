from urllib.parse import parse_qs
import logging
from channels.auth import AuthMiddlewareStack
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Users
from rest_framework.exceptions import AuthenticationFailed
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)

class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        
        token = query_params.get('token', [None])[0]
        
        if not token:
            raise AuthenticationFailed('Invalid or missing token')

        jwt_authenticator = JWTAuthentication()

        fake_request = type('Request', (object,), {'META': {'HTTP_AUTHORIZATION': f'Bearer {token}'}})()

        try:
            user, validated_token = await sync_to_async(jwt_authenticator.authenticate)(fake_request)

            if user:
                scope['user'] = user
                logger.info(f"User {user} authenticated successfully")
            else:
                raise AuthenticationFailed('Invalid or expired token')
        
        except AuthenticationFailed as e:
            logger.error(f"Authentication failed: {e}")
            raise AuthenticationFailed('Invalid or expired token')

        # Llamar al siguiente middleware
        return await self.inner(scope, receive, send)

# Apilar el middleware
def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))