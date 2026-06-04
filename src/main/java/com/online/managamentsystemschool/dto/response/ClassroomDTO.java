package com.online.managamentsystemschool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomDTO {
    private Integer id;
    private String name;
    private String grade;
    private Integer schoolYear;
    private Long studentCount;
}
