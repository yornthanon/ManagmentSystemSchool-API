package com.online.managamentsystemschool.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGradeRequest {

    @NotNull(message = "Student ID is required")
    private Integer studentId;

    @NotNull(message = "Subject ID is required")
    private Integer subjectId;

    @NotNull(message = "Classroom ID is required")
    private Integer classroomId;

    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.0", message = "Score must be at least 0")
    @DecimalMax(value = "100.0", message = "Score must not exceed 100")
    private BigDecimal score;
}

