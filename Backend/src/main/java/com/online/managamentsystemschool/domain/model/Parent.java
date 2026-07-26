package com.online.managamentsystemschool.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Parent {
    private Integer id;
    private Integer userId;
    private String phone;
    private List<Integer> studentIds;
}
