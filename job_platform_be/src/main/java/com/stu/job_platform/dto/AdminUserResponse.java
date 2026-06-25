// AdminUserResponse.java
package com.stu.job_platform.dto;
import lombok.Data;

@Data
public class AdminUserResponse {
    private Integer id;
    private String name;
    private String email;
    private Integer status;
    private String companyName;
    private String taxCode;
    private String websiteUrl;
    private String statusTrust;
}