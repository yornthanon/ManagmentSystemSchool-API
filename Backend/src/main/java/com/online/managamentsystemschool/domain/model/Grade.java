package com.online.managamentsystemschool.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Grade {
    private Integer id;
    private Integer studentId;
    private Integer subjectId;
    private Integer classroomId;
    private BigDecimal score;
}
