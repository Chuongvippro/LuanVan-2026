package com.stu.job_platform.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO nhận dữ liệu khi Recruiter tạo/sửa bài đăng tuyển dụng
 */
public class JobPostRequest {

    @NotBlank(message = "Tiêu đề không được để trống!")
    private String title;

    private String salary;
    private String location;
    private String jobType;       // full-time, part-time, remote, internship
    private String experienceLevel; // junior, mid, senior

    @NotBlank(message = "Mô tả công việc không được để trống!")
    private String jdText;

    private String requirements;
    private String benefits;
    private Integer categoryId;

    // Getter & Setter
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public String getJdText() { return jdText; }
    public void setJdText(String jdText) { this.jdText = jdText; }
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
}
