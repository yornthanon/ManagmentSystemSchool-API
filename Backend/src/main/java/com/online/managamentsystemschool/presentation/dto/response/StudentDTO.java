package com.online.managamentsystemschool.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Integer id;
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String gender;
    private LocalDate dateOfBirth;
}
