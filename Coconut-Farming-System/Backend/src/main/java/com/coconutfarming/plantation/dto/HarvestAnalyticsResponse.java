package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import java.util.List;

public class HarvestAnalyticsResponse {
    private List<MonthBucket> byMonth;
    private List<SeasonBucket> bySeason;
    private YieldPerAcre yieldPerAcre;

    public HarvestAnalyticsResponse() {}

    public HarvestAnalyticsResponse(List<MonthBucket> byMonth, List<SeasonBucket> bySeason, YieldPerAcre yieldPerAcre) {
        this.byMonth = byMonth;
        this.bySeason = bySeason;
        this.yieldPerAcre = yieldPerAcre;
    }

    public List<MonthBucket> getByMonth() {
        return byMonth;
    }

    public void setByMonth(List<MonthBucket> byMonth) {
        this.byMonth = byMonth;
    }

    public List<SeasonBucket> getBySeason() {
        return bySeason;
    }

    public void setBySeason(List<SeasonBucket> bySeason) {
        this.bySeason = bySeason;
    }

    public YieldPerAcre getYieldPerAcre() {
        return yieldPerAcre;
    }

    public void setYieldPerAcre(YieldPerAcre yieldPerAcre) {
        this.yieldPerAcre = yieldPerAcre;
    }

    public static class MonthBucket {
        private String month;
        private Integer totalCoconuts;

        public MonthBucket() {}

        public MonthBucket(String month, Integer totalCoconuts) {
            this.month = month;
            this.totalCoconuts = totalCoconuts;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public Integer getTotalCoconuts() {
            return totalCoconuts;
        }

        public void setTotalCoconuts(Integer totalCoconuts) {
            this.totalCoconuts = totalCoconuts;
        }
    }

    public static class SeasonBucket {
        private String season;
        private Integer totalCoconuts;

        public SeasonBucket() {}

        public SeasonBucket(String season, Integer totalCoconuts) {
            this.season = season;
            this.totalCoconuts = totalCoconuts;
        }

        public String getSeason() {
            return season;
        }

        public void setSeason(String season) {
            this.season = season;
        }

        public Integer getTotalCoconuts() {
            return totalCoconuts;
        }

        public void setTotalCoconuts(Integer totalCoconuts) {
            this.totalCoconuts = totalCoconuts;
        }
    }

    public static class YieldPerAcre {
        private BigDecimal areaInAcres;
        private Integer totalCoconuts;
        private BigDecimal yieldPerAcre;

        public YieldPerAcre() {}

        public YieldPerAcre(BigDecimal areaInAcres, Integer totalCoconuts, BigDecimal yieldPerAcre) {
            this.areaInAcres = areaInAcres;
            this.totalCoconuts = totalCoconuts;
            this.yieldPerAcre = yieldPerAcre;
        }

        public BigDecimal getAreaInAcres() {
            return areaInAcres;
        }

        public void setAreaInAcres(BigDecimal areaInAcres) {
            this.areaInAcres = areaInAcres;
        }

        public Integer getTotalCoconuts() {
            return totalCoconuts;
        }

        public void setTotalCoconuts(Integer totalCoconuts) {
            this.totalCoconuts = totalCoconuts;
        }

        public BigDecimal getYieldPerAcre() {
            return yieldPerAcre;
        }

        public void setYieldPerAcre(BigDecimal yieldPerAcre) {
            this.yieldPerAcre = yieldPerAcre;
        }
    }
}
