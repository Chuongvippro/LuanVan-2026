package com.stu.job_platform.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String address;
    private String companyName;
    private String taxCode;
    private String companyEmail;
    private String websiteUrl;

    // --- GENERATE GETTER VÀ SETTER THUỒN ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }

    public String getCompanyEmail() { return companyEmail; }
    public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
}