from django.contrib.auth import get_user_model
from django.test import TestCase

from .serializers import RegisterSerializer


class RegisterSerializerTests(TestCase):
    def test_creates_user_with_normalized_email_and_hashed_password(self):
        serializer = RegisterSerializer(
            data={
                "email": "New.User@Example.com",
                "password": "A-long-random-password-491!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.email, "new.user@example.com")
        self.assertTrue(user.check_password("A-long-random-password-491!"))
        self.assertNotEqual(user.password, "A-long-random-password-491!")

    def test_rejects_email_already_used_by_google_account(self):
        user_model = get_user_model()
        user_model.objects.create_user(
            username="existing-google-user",
            email="existing@example.com",
            password=None,
        )
        serializer = RegisterSerializer(
            data={
                "email": "EXISTING@example.com",
                "password": "A-long-random-password-491!",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_rejects_password_that_fails_django_validators(self):
        serializer = RegisterSerializer(
            data={"email": "new@example.com", "password": "password"}
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)
