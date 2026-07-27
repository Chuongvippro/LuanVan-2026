package com.stu.job_platform.dto;

import com.stu.job_platform.entity.Recruiter;

public class RecruiterTrustResponse {
    private Integer id; // Sửa từ Long -> Integer
    private String companyName;
    private String companyEmail;
    private String websiteUrl;
    private String taxCode;
    private String logo;
    private Integer point;
    private String statusTrust;

    // Default Constructor
    public RecruiterTrustResponse() {
    }

    // Constructor mapping từ Entity Recruiter
    public RecruiterTrustResponse(Recruiter r) {
        if (r != null) {
            this.id = r.getId();
            this.companyName = r.getCompanyName();
            this.companyEmail = r.getCompanyEmail();
            this.websiteUrl = r.getWebsiteUrl();
            this.taxCode = r.getTaxCode();
            this.logo = r.getLogo();
            this.point = r.getPoint();
            this.statusTrust = r.getStatusTrust();
        }
    }

    // Full Constructor
    public RecruiterTrustResponse(Integer id, String companyName, String companyEmail, String websiteUrl, 
                                 String taxCode, String logo, Integer point, String statusTrust) {
        this.id = id;
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.websiteUrl = websiteUrl;
        this.taxCode = taxCode;
        this.logo = logo;
        this.point = point;
        this.statusTrust = statusTrust;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public Integer getPoint() {
        return point;
    }

    public void setPoint(Integer point) {
        this.point = point;
    }

    public String getStatusTrust() {
        return statusTrust;
    }

    public void setStatusTrust(String statusTrust) {
        this.statusTrust = statusTrust;
    }
}