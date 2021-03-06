module Api
  module V1
    class CompetitionsController < Api::V1::ApplicationController
      # before_action :authenticate!

      # 获取比赛列表
      # GET /api/v1/competitions

      def index
        optional! :page, default: 1
        optional! :per, default: 20, values: 1..100
        @competitions = Competition.where.not(status: 0).page(params[:page]).per(params[:per])
        render json: @competitions
      end

      def get_events
        optional! :page, default: 1
        optional! :per, default: 20, values: 1..100
        requires! :comp_id
        @events = CompetitionService.get_events(params[:comp_id])
        render json: @events
      end

    end
  end
end