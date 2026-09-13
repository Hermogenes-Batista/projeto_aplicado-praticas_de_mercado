import logging
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)
User = get_user_model()


class GoogleConfigAPIView(APIView):
    """
    Retorna o Client ID do Google configurado no backend para o frontend Next.js.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        provider_config = getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {}).get('google', {})
        client_id = provider_config.get('APP', {}).get('client_id', '')
        return Response({
            "client_id": client_id,
        })


class GoogleAuthAPIView(APIView):
    """
    Recebe as credenciais do Google enviadas pelo frontend (Next.js):
    - 'id_token' ou 'credential' (Google Identity Services)
    - ou 'code' (código OAuth2 para troca no backend)

    Valida o token com a API oficial do Google, cria ou recupera o usuário no MySQL,
    e retorna um Token de Autenticação do Django REST Framework (DRF) e os dados do usuário.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        id_token = data.get('id_token') or data.get('credential')
        code = data.get('code')
        redirect_uri = data.get('redirect_uri', 'http://localhost:3000/auth/callback')

        user_info = None

        # 1. Fluxo via ID Token / Credential (Google Identity Services / Popup)
        if id_token:
            try:
                # Validação oficial com endpoint tokeninfo do Google
                verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
                res = requests.get(verify_url, timeout=10)
                if res.status_code == 200:
                    token_info = res.json()
                    user_info = {
                        "email": token_info.get("email"),
                        "sub": token_info.get("sub"),
                        "name": token_info.get("name", ""),
                        "given_name": token_info.get("given_name", ""),
                        "family_name": token_info.get("family_name", ""),
                        "picture": token_info.get("picture", ""),
                        "email_verified": token_info.get("email_verified") in ("true", True),
                    }
                else:
                    logger.warning(f"Falha ao validar ID token com Google: {res.text}")
                    return Response(
                        {"error": "Token do Google inválido ou expirado.", "details": res.text},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                logger.error(f"Erro ao conectar com Google API: {e}")
                return Response(
                    {"error": f"Erro de comunicação com serviço de autenticação do Google: {str(e)}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

        # 2. Fluxo via Authorization Code
        elif code:
            try:
                provider_config = getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {}).get('google', {})
                client_id = provider_config.get('APP', {}).get('client_id')
                client_secret = provider_config.get('APP', {}).get('secret')

                token_url = "https://oauth2.googleapis.com/token"
                payload = {
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                }
                token_res = requests.post(token_url, data=payload, timeout=10)
                if token_res.status_code == 200:
                    token_data = token_res.json()
                    access_token = token_data.get("access_token")
                    
                    # Obter dados do usuário via userinfo endpoint
                    userinfo_res = requests.get(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        headers={"Authorization": f"Bearer {access_token}"},
                        timeout=10
                    )
                    if userinfo_res.status_code == 200:
                        uinfo = userinfo_res.json()
                        user_info = {
                            "email": uinfo.get("email"),
                            "sub": uinfo.get("sub"),
                            "name": uinfo.get("name", ""),
                            "given_name": uinfo.get("given_name", ""),
                            "family_name": uinfo.get("family_name", ""),
                            "picture": uinfo.get("picture", ""),
                            "email_verified": uinfo.get("email_verified", True),
                        }
                    else:
                        return Response(
                            {"error": "Falha ao obter perfil do usuário no Google."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    return Response(
                        {"error": "Código de autorização do Google inválido.", "details": token_res.text},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {"error": f"Erro no intercâmbio de código OAuth: {str(e)}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

        # 3. Modo de Demonstração / Teste (útil em desenvolvimento caso o cliente ainda não tenha configurado origens no Google Cloud)
        elif data.get('demo') is True and settings.DEBUG:
            email = data.get('email', 'dev.usuario@gmail.com')
            user_info = {
                "email": email,
                "sub": "demo_google_123456",
                "name": data.get('name', 'Usuário Demonstração Google'),
                "given_name": data.get('given_name', 'Usuário'),
                "family_name": data.get('family_name', 'Demonstração'),
                "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                "email_verified": True,
            }

        else:
            return Response(
                {"error": "Nenhum token ou código de autenticação do Google foi fornecido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user_info or not user_info.get("email"):
            return Response(
                {"error": "Não foi possível obter o e-mail do perfil Google."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = user_info["email"].lower().strip()

        # Localizar ou criar usuário no MySQL via Django ORM
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
            )
            user.set_unusable_password()
            user.save()
        else:
            # Atualizar nomes caso estejam vazios
            updated = False
            if not user.first_name and user_info.get("given_name"):
                user.first_name = user_info["given_name"]
                updated = True
            if not user.last_name and user_info.get("family_name"):
                user.last_name = user_info["family_name"]
                updated = True
            if updated:
                user.save()

        # Tentar vincular com SocialAccount do Allauth se a tabela existir
        try:
            from allauth.socialaccount.models import SocialAccount
            SocialAccount.objects.get_or_create(
                user=user,
                provider='google',
                defaults={
                    'uid': user_info.get('sub') or email,
                    'extra_data': user_info,
                }
            )
        except Exception as e:
            logger.debug(f"SocialAccount linkage notice: {e}")

        # Gerar / recuperar o Token de Autenticação do DRF (persistido no MySQL)
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "picture": user_info.get("picture", ""),
            },
            "message": "Autenticação via Google realizada com sucesso."
        }, status=status.HTTP_200_OK)


class UserMeAPIView(APIView):
    """
    Endpoint autenticado para obter dados do usuário logado via Token.
    Header esperado: Authorization: Token <seu_token>
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
        })


class LogoutAPIView(APIView):
    """
    Revoga / remove o Token de autenticação do usuário.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Exclui o token no MySQL
            request.auth.delete()
        except (AttributeError, Exception):
            pass
        return Response(
            {"detail": "Sessão encerrada e token revogado com sucesso."},
            status=status.HTTP_200_OK
        )
