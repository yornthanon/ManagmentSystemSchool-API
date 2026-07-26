package com.online.managamentsystemschool.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomSubject {
    private Integer id;
    private Integer classroomId;
    private Integer subjectId;
    private Integer teacherId;
}
