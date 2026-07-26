package com.online.managamentsystemschool.domain.model;

import com.online.managamentsystemschool.domain.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    private Integer id;
    private Integer studentId;
    private Integer classroomId;
    private LocalDate date;
    private AttendanceStatus status;
}
