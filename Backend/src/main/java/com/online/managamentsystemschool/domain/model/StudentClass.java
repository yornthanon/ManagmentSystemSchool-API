package com.online.managamentsystemschool.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentClass {
    private Integer id;
    private Integer studentId;
    private Integer classroomId;
}
