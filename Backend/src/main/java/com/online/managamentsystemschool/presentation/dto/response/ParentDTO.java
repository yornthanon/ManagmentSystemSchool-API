package com.online.managamentsystemschool.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentDTO {
    private Integer id;
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
}
