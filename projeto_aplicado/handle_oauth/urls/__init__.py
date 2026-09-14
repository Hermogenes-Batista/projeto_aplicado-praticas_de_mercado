from .config import urlpatterns as config_urlpatterns
from .google import urlpatterns as google_urlpatterns
from .logout import urlpatterns as logout_urlpatterns
from .user import urlpatterns as user_urlpatterns

app_name = "handle_oauth"
urlpatterns = (
    config_urlpatterns
    + google_urlpatterns
    + user_urlpatterns
    + logout_urlpatterns
)

__all__ = ["app_name", "urlpatterns"]
