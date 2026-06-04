package com.online.managamentsystemschool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDTO {
    private Integer id;
    private String title;
    private String content;
    private LocalDateTime publishedAt;
    private Integer authorId;
    private String authorName;
}
