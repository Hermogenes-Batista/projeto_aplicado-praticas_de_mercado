from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from ..cookies import REFRESH_COOKIE, set_auth_cookies


class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200:
            set_auth_cookies(
                response,
                response.data["access"],
                response.data["refresh"],
            )
        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data["refresh"] = data.get("refresh") or request.COOKIES.get(REFRESH_COOKIE)
        request._full_data = data
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh = response.data.get("refresh") or data["refresh"]
            set_auth_cookies(response, response.data["access"], refresh)
        return response
