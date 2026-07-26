package com.online.managamentsystemschool.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {
    private Integer id;
    private Integer studentId;
    private String studentName;
    private Integer subjectId;
    private String subjectName;
    private Integer classroomId;
    private String classroomName;
    private BigDecimal score;
}
