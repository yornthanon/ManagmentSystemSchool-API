package com.online.managamentsystemschool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomSubjectDTO {
    private Integer id;
    private Integer classroomId;
    private String classroomName;
    private Integer subjectId;
    private String subjectName;
    private Integer teacherId;
    private String teacherName;
}
