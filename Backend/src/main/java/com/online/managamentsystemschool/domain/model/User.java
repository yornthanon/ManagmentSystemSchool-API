package com.online.managamentsystemschool.domain.model;

import com.online.managamentsystemschool.domain.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private Role role;
}
