package com.online.managamentsystemschool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Integer id;
    private Integer studentId;
    private String studentName;
    private Integer classroomId;
    private String classroomName;
    private LocalDate date;
    private String status;
}
