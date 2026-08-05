package com.stu.job_platform.dto;

public class UserSettingsRequest {
    // Notifications
    private Boolean emailNewJob;
    private Boolean emailApplication;
    private Boolean emailNewsletter;
    private Boolean browserPush;

    // Appearance
    private String fontSize;
    private String language;
    private String theme;

    // --- GETTERS & SETTERS ---
    public Boolean getEmailNewJob() { return emailNewJob; }
    public void setEmailNewJob(Boolean emailNewJob) { this.emailNewJob = emailNewJob; }

    public Boolean getEmailApplication() { return emailApplication; }
    public void setEmailApplication(Boolean emailApplication) { this.emailApplication = emailApplication; }

    public Boolean getEmailNewsletter() { return emailNewsletter; }
    public void setEmailNewsletter(Boolean emailNewsletter) { this.emailNewsletter = emailNewsletter; }

    public Boolean getBrowserPush() { return browserPush; }
    public void setBrowserPush(Boolean browserPush) { this.browserPush = browserPush; }

    public String getFontSize() { return fontSize; }
    public void setFontSize(String fontSize) { this.fontSize = fontSize; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
