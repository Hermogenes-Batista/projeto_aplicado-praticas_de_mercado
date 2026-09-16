import graphene
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from ...views.google import GoogleAuthAPIView
from ..types import UserType


class GoogleLoginMutation(graphene.Mutation):
    class Arguments:
        credential = graphene.String()
        code = graphene.String()
        redirect_uri = graphene.String()
        demo = graphene.Boolean()
        email = graphene.String()
        name = graphene.String()

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)
    access = graphene.String()
    refresh = graphene.String()
    user = graphene.Field(UserType)

    @classmethod
    def mutate(
        cls,
        root,
        info,
        credential=None,
        code=None,
        redirect_uri=None,
        demo=False,
        email=None,
        name=None,
    ):
        if demo:
            user_info = {
                "email": (email or "usuario.google@gmail.com").lower().strip(),
                "name": name or "Usuário Google Teste",
                "given_name": (name or "Usuário Google Teste").split(" ")[0],
                "family_name": "",
                "sub": email or "demo-user",
                "picture": "",
                "email_verified": True,
            }
        else:
            user_info = None
        if not credential and not code:
            if not demo:
                return cls(success=False, errors=["Credencial Google não informada."])

        view = GoogleAuthAPIView()
        if not demo:
            user_info = view._get_user_info(
                credential,
                code,
                redirect_uri or "http://localhost:3000/auth/callback",
            )
        if isinstance(user_info, Response):
            details = user_info.data.get("error", "Falha na autenticação Google.")
            return cls(success=False, errors=[str(details)])
        if not user_info or not user_info.get("email"):
            return cls(success=False, errors=["O e-mail do perfil Google não foi obtido."])

        user = view._get_or_create_user(user_info)
        view._link_social_account(user, user_info)
        refresh = RefreshToken.for_user(user)
        info.context._auth_tokens = (str(refresh.access_token), str(refresh))
        return cls(
            success=True,
            errors=[],
            access=str(refresh.access_token),
            refresh=str(refresh),
            user=user,
        )
