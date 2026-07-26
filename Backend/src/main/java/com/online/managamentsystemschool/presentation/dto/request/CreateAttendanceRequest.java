package com.online.managamentsystemschool.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAttendanceRequest {

    @NotNull(message = "Student ID is required")
    private Integer studentId;

    @NotNull(message = "Classroom ID is required")
    private Integer classroomId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(PRESENT|ABSENT|LATE|EXCUSED)$", message = "Status must be PRESENT, ABSENT, LATE, or EXCUSED")
    private String status;
}

