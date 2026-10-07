from django.contrib.auth import get_user_model
from django.test import TestCase

from .serializers import ProfileSerializer, RegisterSerializer


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


class ProfileSerializerTests(TestCase):
    def test_updates_profile_and_hashes_optional_password(self):
        user = get_user_model().objects.create_user(
            username="before", password="Existing-password-491!"
        )
        serializer = ProfileSerializer(
            user,
            data={
                "username": "after",
                "first_name": "First",
                "last_name": "Last",
                "password": "Another-long-password-492!",
            },
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()

        self.assertEqual(updated_user.username, "after")
        self.assertEqual(updated_user.first_name, "First")
        self.assertEqual(updated_user.last_name, "Last")
        self.assertTrue(updated_user.check_password("Another-long-password-492!"))

    def test_profile_update_without_password_keeps_current_password(self):
        user = get_user_model().objects.create_user(
            username="before", password="Existing-password-491!"
        )
        serializer = ProfileSerializer(user, data={"username": "after"}, partial=True)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()

        self.assertTrue(updated_user.check_password("Existing-password-491!"))
