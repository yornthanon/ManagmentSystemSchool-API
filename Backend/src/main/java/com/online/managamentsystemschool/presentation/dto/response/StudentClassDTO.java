package com.online.managamentsystemschool.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentClassDTO {
    private Integer id;
    private Integer studentId;
    private String studentName;
    private Integer classroomId;
    private String classroomName;
}
