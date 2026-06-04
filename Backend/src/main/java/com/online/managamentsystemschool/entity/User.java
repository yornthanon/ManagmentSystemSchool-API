package com.online.managamentsystemschool.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.online.managamentsystemschool.entity.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 50)
    private String username;

    @JsonIgnore
    @Column(length = 100, nullable = true)
    private String password;

    @Column(length = 100)
    private String fullName;

    @Column(unique = true, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 50)
    private String provider;

    @Column(length = 200)
    private String providerId;

    @JsonIgnore
    @OneToOne(mappedBy = "user", orphanRemoval = true)
    private Student student;

    @JsonIgnore
    @OneToOne(mappedBy = "user", orphanRemoval = true)
    private Teacher teacher;

    @JsonIgnore
    @OneToOne(mappedBy = "user", orphanRemoval = true)
    private Parent parent;

    @JsonIgnore
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private List<Announcement> announcements;
}

