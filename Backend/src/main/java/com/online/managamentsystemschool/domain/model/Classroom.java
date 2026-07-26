package com.online.managamentsystemschool.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {
    private Integer id;
    private String name;
    private String grade;
    private Integer schoolYear;
}
