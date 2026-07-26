package com.online.managamentsystemschool.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateClassroomRequest {

    @NotBlank(message = "Classroom name is required")
    private String name;

    @NotBlank(message = "Grade is required")
    private String grade;

    @NotNull(message = "School year is required")
    @Min(value = 1900, message = "School year must be valid")
    private Integer schoolYear;
}
