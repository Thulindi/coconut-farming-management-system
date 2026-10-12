package com.coconutfarming.plantation.dto;

import java.util.List;

public class FertilizingTimelineResponse {
    private List<FertilizerScheduleResponse> overdue;
    private List<FertilizerScheduleResponse> upcoming;
    private List<FertilizerApplicationResponse> completed;

    public FertilizingTimelineResponse() {}

    public FertilizingTimelineResponse(List<FertilizerScheduleResponse> overdue,
                                       List<FertilizerScheduleResponse> upcoming,
                                       List<FertilizerApplicationResponse> completed) {
        this.overdue = overdue;
        this.upcoming = upcoming;
        this.completed = completed;
    }

    public List<FertilizerScheduleResponse> getOverdue() {
        return overdue;
    }

    public void setOverdue(List<FertilizerScheduleResponse> overdue) {
        this.overdue = overdue;
    }

    public List<FertilizerScheduleResponse> getUpcoming() {
        return upcoming;
    }

    public void setUpcoming(List<FertilizerScheduleResponse> upcoming) {
        this.upcoming = upcoming;
    }

    public List<FertilizerApplicationResponse> getCompleted() {
        return completed;
    }

    public void setCompleted(List<FertilizerApplicationResponse> completed) {
        this.completed = completed;
    }
}
