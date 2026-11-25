package com.school.enrollment;

import com.school.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "enrollments")
@Data
@EqualsAndHashCode(callSuper = true)
public class Enrollment extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "classroom_id", nullable = false)
    private Long classroomId;

    @Column(nullable = false)
    private String status = "ACTIVE";
}
