from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Habit, HabitLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'date', 'completed', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HabitSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    current_streak = serializers.SerializerMethodField()
    longest_streak = serializers.SerializerMethodField()
    today_completed = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = ['id', 'user', 'name', 'description', 'color', 'icon',
                  'created_at', 'updated_at', 'current_streak', 'longest_streak',
                  'today_completed']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        user = self.context['request'].user
        if self.instance is None:
            if Habit.objects.filter(user=user, name=value).exists():
                raise serializers.ValidationError("You already have a habit with this name.")
        else:
            if Habit.objects.filter(user=user, name=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("You already have a habit with this name.")
        return value

    def get_current_streak(self, obj):
        return obj.get_current_streak()

    def get_longest_streak(self, obj):
        return obj.get_longest_streak()

    def get_today_completed(self, obj):
        from datetime import date
        today = date.today()
        log = obj.logs.filter(date=today).first()
        return log.completed if log else False


class HabitDetailSerializer(HabitSerializer):
    logs = HabitLogSerializer(many=True, read_only=True)

    class Meta(HabitSerializer.Meta):
        fields = HabitSerializer.Meta.fields + ['logs']
