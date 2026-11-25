package com.school.user;

public enum Role {

    ADMIN("admin"),
    TEACHER("teacher"),
    STUDENT("student");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role cannot be null or blank");
        }
        for (Role role : values()) {
            if (role.value.equalsIgnoreCase(value.trim())) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}
