package com.online.managamentsystemschool.domain.enums;

public enum Role {
    ADMIN("admin"),
    STUDENT("student"),
    TEACHER("teacher"),
    PARENT("parent");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromString(String value) {
        if (value != null) {
            for (Role role : Role.values()) {
                if (role.value.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value)) {
                    return role;
                }
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
