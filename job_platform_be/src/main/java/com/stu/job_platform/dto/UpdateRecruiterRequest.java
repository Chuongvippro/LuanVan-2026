// UpdateRecruiterRequest.java
package com.stu.job_platform.dto;
import lombok.Data;

@Data
public class UpdateRecruiterRequest {
    private String name;
    private String email;
    private String companyName;
    private String taxCode;
    private String websiteUrl;
    private String websitePending;
    private Boolean verifiedName;
    private Boolean verifiedTax;
    private Boolean verifiedWebsite;
}