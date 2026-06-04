package com.online.managamentsystemschool.entity.enums;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RoleTest {

    @Test
    void fromString_shouldReturnCorrectEnum() {
        assertEquals(Role.ADMIN, Role.fromString("admin"));
        assertEquals(Role.ADMIN, Role.fromString("ADMIN"));
        assertEquals(Role.STUDENT, Role.fromString("student"));
        assertEquals(Role.TEACHER, Role.fromString("teacher"));
        assertEquals(Role.PARENT, Role.fromString("parent"));
    }

    @Test
    void fromString_shouldThrowForInvalidRole() {
        assertThrows(IllegalArgumentException.class, () -> Role.fromString("invalid"));
        assertThrows(IllegalArgumentException.class, () -> Role.fromString(""));
    }

    @Test
    void fromString_shouldThrowForNull() {
        assertThrows(IllegalArgumentException.class, () -> Role.fromString(null));
    }

    @Test
    void getValue_shouldReturnLowercase() {
        assertEquals("admin", Role.ADMIN.getValue());
        assertEquals("student", Role.STUDENT.getValue());
        assertEquals("teacher", Role.TEACHER.getValue());
        assertEquals("parent", Role.PARENT.getValue());
    }
}
