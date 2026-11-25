package com.school.classroom;

import com.school.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "classrooms")
@Data
@EqualsAndHashCode(callSuper = true)
public class Classroom extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private String academicYear;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity = 30;
}
