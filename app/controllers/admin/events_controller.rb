class Admin::EventsController < AdminController
  before_action :set_event, only: [:show, :edit, :update, :destroy]

  before_action do
    authenticate_permissions(['editor', 'admin'])
  end

  # GET /admin/events
  # GET /admin/events.json
  def index
    events = Event.includes(:parent_event).joins(:competition).order('competition_id desc,is_father desc, parent_id'); false
    if params[:field].present? && params[:keyword].present?
      if params[:field] == 'competition'
        events = events.where(["competitions.name like ?", "%#{params[:keyword]}%"])
      else
        events = events.where(["events.#{params[:field]} like ?", "%#{params[:keyword]}%"])
      end
    end
    @events= events.select('events.*', 'competitions.name as comp_name').page(params[:page]).per(params[:per])

    respond_to do |format|
      format.html
      format.xls {
        data = @events.order('competition_id desc,is_father desc').map { |x| {
            所属比赛: x.comp_name,
            名称: x.name,
            组别名: x.is_father ? '是' : nil,
            包含组别: x.group.gsub(/[1-4]/, '1' => '小', '2' => '中', '3' => '初', '4' => '高'),
            队伍允许人数: x.is_father ? nil : "#{x.team_min_num}"+"#{x.team_max_num>1 ? "-#{x.team_max_num}" : nil}",
        } }
        filename = "Event-Export-#{Time.now.strftime("%Y%m%d%H%M%S")}.xls"
        send_data(data.to_xls, :type => "text/xls;charset=utf-8,header=present", :filename => filename)
      }
    end
  end

  # GET /admin/events/1
  # GET /admin/events/1.json
  def show
    @score_attributes = EventSaShip.includes(:score_attribute, :score_attribute_parent).where(event_id: params[:id], is_parent: 0).order('parent_id asc').map { |s| {
        id: s.id,
        name: s.level==1 ? s.score_attribute.name : s.score_attribute_parent.name+': '+ s.score_attribute.name,
        write_type: s.score_attribute.write_type,
        desc: s.desc.blank? ? nil : s.desc
    } }
  end

  def edit_event_sa_desc
    desc = params[:desc]
    sa_id = params[:sa_id]
    if desc.present? && sa_id.present?
      sa_ship = EventSaShip.find_by_id(sa_id)
      if sa_ship
        sa_ship.desc = desc
        if sa_ship.save
          result = [true, '操作成功 ']
        else
          result = [false, '更改失败']
        end
      else
        result = [false, '参数不规范']
      end
    else
      result = [false, '参数不完整']
    end
    render json: result
  end


  # GET /admin/events/new
  def new
    @event = Event.new
  end

  # GET /admin/events/1/edit
  def edit
  end

  def teams
    status = params[:status]
    @event = Event.find(params[:id])
    case status
      when '组队中' then
        status == 0
      when '报名成功' then
        status == 1
      when '待学校审核' then
        status == 2
      when '待区县审核' then
        status == 3
      when '学校拒绝' then
        status == -2
      when '区县拒绝' then
        status == -3
      else
        status == nil
    end
    teams = Team.includes(:team_user_ships, :user).where(event_id: params[:id]); false
    if status.present?
      teams = teams.where(status: params[:status])
    end
    @teams = teams.page(params[:page]).per(params[:per])
  end


  def add_score_attributes
    if request.method == 'POST'
      ed = params[:ed]
      sa_ids = params[:sa_ids]
      parent_id = params[:parent_id]
      if sa_ids.present? && parent_id.present?
        parent_sa = EventSaShip.where(event_id: ed, score_attribute_id: parent_id, level: 1).take
        if parent_sa.present?
          unless parent_sa.is_parent
            parent_sa.update_attributes(is_parent: 1)
          end
        else
          EventSaShip.create!(event_id: ed, score_attribute_id: parent_id, is_parent: 1)
        end
        sa_ids.each do |sa_id|
          esa = EventSaShip.where(event_id: ed, score_attribute_id: sa_id, parent_id: parent_id).take
          unless esa.present?
            EventSaShip.create!(event_id: ed, score_attribute_id: sa_id, parent_id: parent_id, level: 2)
          end
        end
      elsif sa_ids.present?
        sa_ids.each do |sa_id|
          esa = EventSaShip.where(event_id: ed, score_attribute_id: sa_id, level: 1, is_parent: 0).take
          unless esa.present?
            EventSaShip.create!(event_id: ed, score_attribute_id: sa_id)
          end
        end
      end
      flash[:notice]= '所选属性已成功添加'
      render json: true
    end
  end

  def delete_score_attribute
    if params[:sa_id].present?
      sa = EventSaShip.find(params[:sa_id])
      if sa.is_parent && EventSaShip.where(['id = :sa_id OR parent_id = :value', {:sa_id => params[:sa_id], :value => sa.score_attribute_id}]).delete_all
        result = [true, '删除成功']
      elsif EventSaShip.delete(params[:sa_id])
        result = [true, '删除成功']
      else
        result = [false, '删除失败']
      end
    else
      result = [false, '不规范请求']
    end
    render json: result
  end

  # POST /admin/events
  # POST /admin/events.json
  def create
    @event = Event.new(event_params)

    respond_to do |format|
      if @event.save
        format.html { redirect_to [:admin, @event], notice: '比赛项目创建成功' }
        format.json { render action: 'show', status: :created, location: @event }
      else
        format.html { render action: 'new' }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end


  # PATCH/PUT /admin/events/1
  # PATCH/PUT /admin/events/1.json
  def update
    respond_to do |format|
      if @event.update(event_params)
        format.html { redirect_to [:admin, @event], notice: '比赛项目更新成功' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/events/1
  # DELETE /admin/events/1.json
  def destroy
    if @event.is_father && Event.where(parent_id: @event.id).exists?
      flash[:notice]='该组名不能删除(目前还包含项目)'
      redirect_back(fallback_location: admin_events_path)
    else
      @event.destroy
      respond_to do |format|
        format.html { redirect_to admin_events_url, notice: '比赛项目删除成功' }
        format.json { head :no_content }
      end
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_event
    @event = Event.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def event_params
    params.require(:event).permit(:name, :is_father, :parent_id, :competition_id, :level, :description, :body_html, :status, :against, :team_min_num, :team_max_num, :apply_start_time, :apply_end_time, :start_time, :end_time, {group: []}).tap do |e|
      if params[:event][:group].present?
        e[:group] = params[:event][:group].join(',')
      else
        e[:group] = nil
      end
    end
  end

end
